import { Schema } from "prosemirror-model";
import { arkpadSchema } from "./schema";
import { ArkpadExtension } from "./types";

/**
 * SchemaBuilder dynamically constructs a ProseMirror schema from Arkpad extensions.
 * Follows the Tiptap extension manager architecture for maximum stability and performance.
 */
export class SchemaBuilder {
  private extensions: ArkpadExtension[];
  private static schemaCache = new Map<string, Schema>();

  constructor(extensions: ArkpadExtension[]) {
    this.extensions = extensions;
  }

  /**
   * Builds and returns the ProseMirror schema.
   */
  build(): Schema {
    // 1. Flatten all extensions (including nested ones) with recursion protection
    const allExtensions = this.flattenExtensions(this.extensions);

    // 2. Sort extensions by priority (Tiptap standard: higher priority runs later/overwrites)
    allExtensions.sort((a, b) => (a.priority || 100) - (b.priority || 100));

    // 3. Check Cache
    const cacheKey = JSON.stringify(allExtensions.map((ext) => ext.name));
    if (SchemaBuilder.schemaCache.has(cacheKey)) {
      return SchemaBuilder.schemaCache.get(cacheKey)!;
    }

    // Initialize with base schema (doc, paragraph, text)
    let nodes = arkpadSchema.spec.nodes as any;
    let marks = arkpadSchema.spec.marks as any;

    // Phase 1: Collect Base Nodes & Marks
    allExtensions.forEach((ext) => {
      if (ext.addNodes) {
        const extNodes = ext.addNodes();
        Object.entries(extNodes).forEach(([name, spec]) => {
          if (marks.get(name)) {
            throw new Error(`Collision: "${name}" is already defined as a mark.`);
          }
          // Tiptap-style: Later extensions overwrite earlier ones if priority allows
          nodes = nodes.get(name) ? nodes.update(name, spec) : nodes.addToEnd(name, spec);
        });
      }

      if (ext.addMarks) {
        const extMarks = ext.addMarks();
        Object.entries(extMarks).forEach(([name, spec]) => {
          if (nodes.get(name)) {
            throw new Error(`Collision: "${name}" is already defined as a node.`);
          }
          marks = marks.get(name) ? marks.update(name, spec) : marks.addToEnd(name, spec);
        });
      }
    });

    // Phase 2: Schema Extensions (Decorators)
    allExtensions.forEach((ext) => {
      if (ext.extendNodeSchema) {
        nodes.forEach((spec: any, name: string) => {
          const newSpec = ext.extendNodeSchema!(name, spec);
          if (newSpec) nodes = nodes.update(name, newSpec);
        });
      }
      if (ext.extendMarkSchema) {
        marks.forEach((spec: any, name: string) => {
          const newSpec = ext.extendMarkSchema!(name, spec);
          if (newSpec) marks = marks.update(name, newSpec);
        });
      }
    });

    // Phase 3: Global Attributes (The Tiptap "Power-Up")
    const globalAttributes = this.collectGlobalAttributes(allExtensions);
    nodes = this.enhanceSchemaElements(nodes, globalAttributes, "node");
    marks = this.enhanceSchemaElements(marks, globalAttributes, "mark");

    const schema = new Schema({ nodes, marks });

    // Cache management
    if (SchemaBuilder.schemaCache.size > 50) SchemaBuilder.schemaCache.clear();
    SchemaBuilder.schemaCache.set(cacheKey, schema);
    
    return schema;
  }

  private collectGlobalAttributes(allExtensions: ArkpadExtension[]) {
    const globals: any[] = [];
    allExtensions.forEach((ext) => {
      if (ext.addGlobalAttributes) {
        globals.push(...ext.addGlobalAttributes());
      }
    });
    return globals;
  }

  private enhanceSchemaElements(elements: any, globals: any[], type: "node" | "mark") {
    let enhancedElements = elements;
    
    // 1. Group global attributes by the types they apply to
    const attributesByTypeName: Record<string, any[]> = {};
    globals.forEach((global) => {
      if (!global.types || !Array.isArray(global.types)) return;
      global.types.forEach((typeName: string) => {
        if (!attributesByTypeName[typeName]) attributesByTypeName[typeName] = [];
        attributesByTypeName[typeName].push(global.attributes || {});
      });
    });

    // 2. Apply all attributes in a single pass per node type
    Object.entries(attributesByTypeName).forEach(([typeName, allAttrs]) => {
      const spec = enhancedElements.get(typeName);
      if (!spec) return;

      const renderMethod = "toDOM";
      
      enhancedElements = enhancedElements.update(typeName, {
        ...spec,
        attrs: {
          ...spec.attrs,
          ...Object.assign({}, ...allAttrs.map(attrs => 
            Object.fromEntries(Object.entries(attrs).map(([key, attr]: [string, any]) => [
              key, { ...(spec.attrs?.[key] || {}), ...attr }
            ]))
          ))
        },
        [renderMethod]: (element: any) => {
          const originalDOM = spec[renderMethod] ? spec[renderMethod](element) : [type === "node" ? "div" : "span", 0];
          if (!Array.isArray(originalDOM)) return originalDOM;

          const [tag, maybeAttrs, ...rest] = originalDOM;
          const hasAttrs = maybeAttrs && typeof maybeAttrs === "object" && !Array.isArray(maybeAttrs);
          const originalAttrs = hasAttrs ? { ...maybeAttrs } : {};
          const content = hasAttrs ? rest : [maybeAttrs, ...rest];

          const newAttrs: Record<string, any> = { ...originalAttrs };

          allAttrs.forEach(attrs => {
            Object.entries(attrs).forEach(([key, attr]: [string, any]) => {
              if (attr.renderHTML) {
                const rendered = attr.renderHTML(element.attrs);
                if (rendered) {
                  Object.entries(rendered).forEach(([rKey, rVal]) => {
                    if (rKey === "class" && newAttrs["class"]) {
                      newAttrs["class"] = `${newAttrs["class"]} ${rVal}`.trim();
                    } else if (rKey === "style" && newAttrs["style"]) {
                      newAttrs["style"] = `${newAttrs["style"]};${rVal}`.replace(/;;/g, ";");
                    } else {
                      newAttrs[rKey] = rVal;
                    }
                  });
                }
              } else if (element.attrs[key] !== undefined && element.attrs[key] !== null) {
                newAttrs[key] = element.attrs[key];
              }
            });
          });

          return [tag, newAttrs, ...content];
        }
      });
    });

    return enhancedElements;
  }

  private flattenExtensions(extensions: ArkpadExtension[]): ArkpadExtension[] {
    const flattened: ArkpadExtension[] = [];
    const seen = new Set<string>();

    const traverse = (exts: ArkpadExtension[]) => {
      exts.forEach((ext, index) => {
        if (!ext || typeof ext !== "object") return;
        
        // Ensure extension has a name for the cache key and duplicate prevention
        if (!ext.name) {
          ext.name = `anonymous_${index}`;
        }

        if (seen.has(ext.name)) return;
        seen.add(ext.name);

        if (ext.addExtensions) {
          try {
            const nested = ext.addExtensions();
            if (Array.isArray(nested)) traverse(nested);
          } catch (e) {
            console.error(`[Arkpad] Failed to load nested extensions for ${ext.name}:`, e);
          }
        }
        flattened.push(ext);
      });
    };

    traverse(extensions);
    return flattened;
  }
}

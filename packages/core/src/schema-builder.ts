import { Schema } from "prosemirror-model";
import { arkpadSchema } from "./schema";
import { ArkpadExtension } from "./types";

/**
 * SchemaBuilder dynamically constructs a ProseMirror schema from Arkpad extensions.
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
    // PRESERVE ORDER: Schema composition is order-sensitive.
    const cacheKey = JSON.stringify(this.extensions.map((ext) => ext.name || "anonymous"));

    if (SchemaBuilder.schemaCache.has(cacheKey)) {
      return SchemaBuilder.schemaCache.get(cacheKey)!;
    }

    let nodes = arkpadSchema.spec.nodes as any;
    let marks = arkpadSchema.spec.marks as any;

    const allExtensions: ArkpadExtension[] = [];

    const flattenExtensions = (exts: ArkpadExtension[]) => {
      for (const extension of exts) {
        if (!extension || typeof extension !== "object") continue;
        allExtensions.push(extension);

        if (extension.addExtensions) {
          try {
            const nested = extension.addExtensions();
            if (Array.isArray(nested)) {
              flattenExtensions(nested);
            }
          } catch (e) {
            console.error(`[Arkpad] Failed to load nested extensions for ${extension.name}:`, e);
          }
        }
      }
    };

    flattenExtensions(this.extensions);

    // Phase 1: Merge Nodes and Marks
    allExtensions.forEach((ext) => {
      if (ext.addNodes) {
        const extNodes = ext.addNodes();
        Object.entries(extNodes).forEach(([name, spec]) => {
          if (marks.get(name)) {
            throw new Error(`Collision: "${name}" is already defined as a mark. Cannot add as node.`);
          }
          nodes = nodes.get(name) ? nodes.update(name, spec) : nodes.addToEnd(name, spec);
        });
      }

      if (ext.addMarks) {
        const extMarks = ext.addMarks();
        Object.entries(extMarks).forEach(([name, spec]) => {
          if (nodes.get(name)) {
            throw new Error(`Collision: "${name}" is already defined as a node. Cannot add as mark.`);
          }
          marks = marks.get(name) ? marks.update(name, spec) : marks.addToEnd(name, spec);
        });
      }
    });

    // Phase 2: Schema Extensions (Decorators)
    allExtensions.forEach((ext) => {
      if (ext.extendNodeSchema) {
        nodes.forEach((name: string, spec: any) => {
          const newSpec = ext.extendNodeSchema!(name, spec);
          if (!newSpec || typeof newSpec !== "object") {
            throw new Error(`Extension "${ext.name}" returned invalid spec for node "${name}"`);
          }
          nodes = nodes.update(name, newSpec);
        });
      }
      if (ext.extendMarkSchema) {
        marks.forEach((name: string, spec: any) => {
          const newSpec = ext.extendMarkSchema!(name, spec);
          if (!newSpec || typeof newSpec !== "object") {
            throw new Error(`Extension "${ext.name}" returned invalid spec for mark "${name}"`);
          }
          marks = marks.update(name, newSpec);
        });
      }
    });

    // Phase 3: Global Attributes
    const globalAttributes = this.collectGlobalAttributes(allExtensions);
    nodes = this.enhanceSchemaElements(nodes, globalAttributes, "node");
    marks = this.enhanceSchemaElements(marks, globalAttributes, "mark");

    const schema = new Schema({ nodes, marks });
    
    // Simple LRU-like cache management
    if (SchemaBuilder.schemaCache.size > 50) {
      SchemaBuilder.schemaCache.clear();
    }
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
    globals.forEach((global) => {
      if (!global.types || !Array.isArray(global.types)) return;
      global.types.forEach((typeName: string) => {
        const spec = enhancedElements.get(typeName);
        if (!spec) return;

        const renderMethod = type === "node" ? "toDOM" : "toDOM"; // Both use toDOM in PM

        enhancedElements = enhancedElements.update(typeName, {
          ...spec,
          attrs: {
            ...spec.attrs,
            ...Object.fromEntries(
              Object.entries(global.attributes || {}).map(([key, attr]: [string, any]) => [
                key,
                { ...(spec.attrs?.[key] || {}), ...attr },
              ])
            ),
          },
          [renderMethod]: (element: any) => {
            const originalDOM = spec[renderMethod] ? spec[renderMethod](element) : [type === "node" ? "div" : "span", 0];
            
            if (!Array.isArray(originalDOM)) return originalDOM;

            const [tag, maybeAttrs, ...rest] = originalDOM;
            const hasAttrs = maybeAttrs && typeof maybeAttrs === "object" && !Array.isArray(maybeAttrs);
            const originalAttrs = hasAttrs ? { ...maybeAttrs } : {};
            const content = hasAttrs ? rest : [maybeAttrs, ...rest];

            const newAttrs: Record<string, any> = { ...originalAttrs };

            Object.entries(global.attributes || {}).forEach(([key, attr]: [string, any]) => {
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

            return [tag, newAttrs, ...content];
          },
        });
      });
    });
    return enhancedElements;
  }
}

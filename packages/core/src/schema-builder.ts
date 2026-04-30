import { Schema } from "prosemirror-model";
import { arkpadSchema } from "./schema";
import { ArkpadExtension } from "./types";

/**
 * SchemaBuilder dynamically constructs a ProseMirror schema from Arkpad extensions.
 * It also applies global attributes to nodes and marks.
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
    // Generate a unique key based on extension names and order
    const cacheKey = this.extensions
      .map((ext) => ext.name)
      .sort()
      .join(",");
    if (SchemaBuilder.schemaCache.has(cacheKey)) {
      return SchemaBuilder.schemaCache.get(cacheKey)!;
    }

    // Start with the base specs from arkpadSchema
    let nodes = arkpadSchema.spec.nodes as any;
    let marks = arkpadSchema.spec.marks as any;

    const allExtensions: ArkpadExtension[] = [];
    const seenNames = new Set<string>();

    const flattenExtensions = (exts: ArkpadExtension[]) => {
      for (const extension of exts) {
        if (!seenNames.has(extension.name)) {
          allExtensions.push(extension);
          seenNames.add(extension.name);
        }

        if (extension.addExtensions) {
          flattenExtensions(extension.addExtensions());
        }
      }
    };

    flattenExtensions(this.extensions);

    // Merge nodes and marks from extensions
    allExtensions.forEach((ext) => {
      if (ext.addNodes) {
        const extNodes = ext.addNodes();
        Object.keys(extNodes).forEach((name) => {
          if (nodes.get(name)) {
            nodes = nodes.update(name, extNodes[name]);
          } else {
            nodes = nodes.addToEnd(name, extNodes[name]);
          }
        });
      }
      if (ext.addMarks) {
        const extMarks = ext.addMarks();
        Object.keys(extMarks).forEach((name) => {
          if (marks.get(name)) {
            marks = marks.update(name, extMarks[name]);
          } else {
            marks = marks.addToEnd(name, extMarks[name]);
          }
        });
      }
    });

    // Apply Global Attributes
    const globalAttributes = this.collectGlobalAttributes(allExtensions);

    nodes = this.enhanceNodes(nodes, globalAttributes);
    marks = this.enhanceMarks(marks, globalAttributes);

    const schema = new Schema({ nodes, marks });

    // Generate cache key again to ensure it's fresh
    const finalCacheKey = this.extensions
      .map((ext) => ext.name)
      .sort()
      .join(",");
    SchemaBuilder.schemaCache.set(finalCacheKey, schema);

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

  private enhanceNodes(nodes: any, globals: any[]) {
    let enhancedNodes = nodes;

    globals.forEach((global) => {
      if (!global.types) return;

      global.types.forEach((type: string) => {
        const nodeSpec = enhancedNodes.get(type);
        if (nodeSpec) {
          enhancedNodes = enhancedNodes.update(type, {
            ...nodeSpec,
            attrs: {
              ...nodeSpec.attrs,
              ...global.attributes,
            },
            toDOM: (node: any) => {
              const dom = nodeSpec.toDOM(node);
              const attrs: Record<string, any> = {};

              // 1. Collect and merge global attributes
              Object.keys(global.attributes || {}).forEach((key) => {
                const attr = global.attributes[key];
                if (attr && attr.renderHTML) {
                  const rendered = attr.renderHTML(node.attrs);
                  if (rendered) {
                    Object.entries(rendered).forEach(([rKey, rVal]) => {
                      if (rKey === "class" && attrs["class"]) {
                        attrs["class"] = `${attrs["class"]} ${rVal}`.trim();
                      } else {
                        attrs[rKey] = rVal;
                      }
                    });
                  }
                } else if (node.attrs[key] !== undefined && node.attrs[key] !== null) {
                  attrs[key] = node.attrs[key];
                }
              });

              // 2. Safely merge with existing DOM attributes
              if (Array.isArray(dom)) {
                const target = dom[1];
                if (target && typeof target === "object" && !Array.isArray(target)) {
                  Object.entries(attrs).forEach(([key, val]) => {
                    if (key === "class" && target["class"]) {
                      target["class"] = `${target["class"]} ${val}`.trim();
                    } else {
                      target[key] = val;
                    }
                  });
                } else {
                  // No attributes object exists, inject one
                  dom.splice(1, 0, attrs);
                }
              }

              return dom;
            },
          });
        }
      });
    });

    return enhancedNodes;
  }

  private enhanceMarks(marks: any, globals: any[]) {
    let enhancedMarks = marks;

    globals.forEach((global) => {
      if (!global.types) return;

      global.types.forEach((type: string) => {
        const markSpec = enhancedMarks.get(type);
        if (markSpec) {
          enhancedMarks = enhancedMarks.update(type, {
            ...markSpec,
            attrs: {
              ...markSpec.attrs,
              ...Object.fromEntries(
                Object.entries(global.attributes || {}).map(([key, attr]: [string, any]) => [
                  key,
                  { default: attr.default },
                ])
              ),
            },
            renderHTML: (mark: any) => {
              const dom = markSpec.renderHTML(mark);
              const attrs: Record<string, any> = {};

              Object.entries(global.attributes || {}).forEach(([key, attr]: [string, any]) => {
                if (attr && attr.renderHTML) {
                  const rendered = attr.renderHTML(mark.attrs);
                  if (rendered) {
                    Object.entries(rendered).forEach(([rKey, rVal]) => {
                      if (rKey === "class" && attrs["class"]) {
                        attrs["class"] = `${attrs["class"]} ${rVal}`.trim();
                      } else {
                        attrs[rKey] = rVal;
                      }
                    });
                  }
                } else if (mark.attrs[key] !== undefined && mark.attrs[key] !== null) {
                  attrs[key] = mark.attrs[key];
                }
              });

              if (Array.isArray(dom)) {
                const target = dom[1];
                if (target && typeof target === "object" && !Array.isArray(target)) {
                  Object.entries(attrs).forEach(([key, val]) => {
                    if (key === "class" && target["class"]) {
                      target["class"] = `${target["class"]} ${val}`.trim();
                    } else {
                      target[key] = val;
                    }
                  });
                } else {
                  dom.splice(1, 0, attrs);
                }
              }

              return dom;
            },
          });
        }
      });
    });

    return enhancedMarks;
  }
}

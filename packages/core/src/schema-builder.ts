import { Schema } from "prosemirror-model";
import { arkpadSchema } from "./schema";
import { ArkpadExtension } from "./types";

/**
 * SchemaBuilder dynamically constructs a ProseMirror schema from Arkpad extensions.
 * It also applies global attributes to nodes and marks.
 */
export class SchemaBuilder {
  private extensions: ArkpadExtension[];

  constructor(extensions: ArkpadExtension[]) {
    this.extensions = extensions;
  }

  /**
   * Builds and returns the ProseMirror schema.
   */
  build(): Schema {
    // Start with the base specs from arkpadSchema
    let nodes = (arkpadSchema.spec.nodes as any);
    let marks = (arkpadSchema.spec.marks as any);

    // Merge nodes and marks from extensions
    this.extensions.forEach(ext => {
      if (ext.addNodes) {
        const extNodes = ext.addNodes();
        Object.keys(extNodes).forEach(name => {
          nodes = nodes.update(name, extNodes[name]);
        });
      }
      if (ext.addMarks) {
        const extMarks = ext.addMarks();
        Object.keys(extMarks).forEach(name => {
          marks = marks.update(name, extMarks[name]);
        });
      }
    });

    // Apply Global Attributes
    const globalAttributes = this.collectGlobalAttributes();

    nodes = this.enhanceNodes(nodes, globalAttributes);
    marks = this.enhanceMarks(marks, globalAttributes);

    return new Schema({ nodes, marks });
  }

  private collectGlobalAttributes() {
    const globals: any[] = [];
    this.extensions.forEach((ext) => {
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
              
              // Apply global attributes to the DOM
              if (dom && dom[1]) {
                Object.keys(global.attributes || {}).forEach(key => {
                  const attr = global.attributes[key];
                  if (attr && attr.renderHTML) {
                    const rendered = attr.renderHTML(node.attrs);
                    if (rendered) {
                      Object.assign(dom[1], rendered);
                    }
                  } else if (node.attrs[key] !== undefined && node.attrs[key] !== null) {
                     // Default: add as attribute if not null
                     dom[1][key] = node.attrs[key];
                  }
                });
              }

              return dom;
            }
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
              
              if (dom && dom[1]) {
                Object.entries(global.attributes || {}).forEach(([key, attr]: [string, any]) => {
                  if (attr && attr.renderHTML) {
                    const rendered = attr.renderHTML(mark.attrs);
                    if (rendered) {
                      Object.assign(dom[1], rendered);
                    }
                  } else if (mark.attrs[key] !== undefined && mark.attrs[key] !== null) {
                    dom[1][key] = mark.attrs[key];
                  }
                });
              }

              return dom;
            }
          });
        }
      });
    });

    return enhancedMarks;
  }
}

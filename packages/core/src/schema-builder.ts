import { Schema, type NodeSpec, type MarkSpec } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
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
    let nodes = addListNodes(
      basicSchema.spec.nodes.update("doc", { content: "block+" }),
      "paragraph block*",
      "block"
    );

    let marks = basicSchema.spec.marks;

    // Apply Global Attributes
    const globalAttributes = this.collectGlobalAttributes();

    // In a real-world scenario, we would iterate through extensions and collect their specific node/mark specs.
    // For now, we will enhance the existing nodes/marks with global attributes.

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
      global.types.forEach((type: string) => {
        if (enhancedNodes.has(type)) {
          const nodeSpec = enhancedNodes.get(type);
          enhancedNodes = enhancedNodes.update(type, {
            ...nodeSpec,
            attrs: {
              ...nodeSpec.attrs,
              ...global.attributes,
            },
            toDOM: (node: any) => {
              const dom = nodeSpec.toDOM(node);
              
              // Apply global attributes to the DOM
              Object.keys(global.attributes).forEach(key => {
                const attr = global.attributes[key];
                if (attr.renderHTML) {
                  const rendered = attr.renderHTML(node.attrs);
                  if (rendered) {
                    Object.assign(dom[1], rendered);
                  }
                } else if (node.attrs[key] !== undefined && node.attrs[key] !== null) {
                   // Default: add as attribute if not null
                   dom[1][key] = node.attrs[key];
                }
              });

              return dom;
            }
          });
        }
      });
    });

    return enhancedNodes;
  }

  private enhanceMarks(marks: any, globals: any[]) {
    // Similar logic for marks
    return marks;
  }
}

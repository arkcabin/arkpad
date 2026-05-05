import { Schema } from "prosemirror-model";

export const arkpadSchema = new Schema({
  nodes: {
    doc: { content: "block+" },
    paragraph: {
      content: "inline*",
      group: "block",
      attrs: { align: { default: "left" } },
      parseDOM: [{ tag: "p", getAttrs: (dom: any) => ({ align: dom.style.textAlign || "left" }) }],
      toDOM: (node: any) => ["p", { style: node.attrs.align !== "left" ? `text-align: ${node.attrs.align}` : null }, 0],
    },
    text: { group: "inline" },
  },
  marks: {},
});

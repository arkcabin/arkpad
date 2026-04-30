import { Schema } from "prosemirror-model";

/**
 * The minimal core schema for Arkpad.
 * This is designed to be "feature-blind", providing only the absolute essentials.
 * All other nodes and marks are injected dynamically via Solo Extensions.
 */
export const arkpadSchema = new Schema({
  nodes: {
    doc: {
      content: "block+",
    },
    paragraph: {
      content: "inline*",
      marks: "_",
      group: "block",
      attrs: { align: { default: "left" } },
      parseDOM: [
        {
          tag: "p",
          getAttrs: (dom: HTMLElement) => ({
            align: dom.style.textAlign || dom.getAttribute("data-align") || "left",
          }),
        },
      ],
      toDOM(node) {
        const { align } = node.attrs;
        return ["p", { "data-align": align, style: align !== "left" ? `text-align: ${align}` : null }, 0];
      },
    },
    text: {
      group: "inline",
    },
  },
  marks: {},
});

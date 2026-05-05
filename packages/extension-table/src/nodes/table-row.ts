import type { NodeSpec } from "prosemirror-model";

export const tableRowNode: NodeSpec = {
  content: "(table_cell | table_header)*",
  attrs: {
    height: { default: null },
  },
  tableRole: "row",
  parseDOM: [
    {
      tag: "tr",
      getAttrs: (dom: HTMLElement) => ({
        height: dom.style.height ? parseInt(dom.style.height, 10) : null,
      }),
    },
  ],
  toDOM(node) {
    const { height } = node.attrs;
    const style = height ? `height: ${height}px` : null;
    return ["tr", { style }, 0];
  },
};

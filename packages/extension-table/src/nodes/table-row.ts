import type { NodeSpec } from "prosemirror-model";
import { NodeRole } from "@arkpad/core";

export const tableRowNode: NodeSpec = {
  content: "(table_cell | table_header)*",
  attrs: {
    height: { default: null },
  },
  tableRole: "row",
  role: NodeRole.LAYOUT,
  allowedRoles: NodeRole.LAYOUT,
  parseDOM: [
    {
      tag: "tr",
      getAttrs: (dom: any) => ({
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

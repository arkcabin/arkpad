import type { NodeSpec } from "prosemirror-model";
import { createColGroup } from "./utilities/createColGroup";
import { NodeRole } from "@arkpad/core";

export const tableNode: NodeSpec = {
  content: "table_row+",
  attrs: {
    style: { default: null },
  },
  tableRole: "table",
  isolating: true,
  role: NodeRole.WIDGET | NodeRole.ISOLATED,
  allowedRoles: NodeRole.LAYOUT,
  group: "block",
  selectable: false,
  parseDOM: [
    {
      tag: "table",
      getAttrs: (dom: HTMLElement) => ({
        style: dom.getAttribute("style"),
      }),
    },
  ],
  toDOM(node) {
    const { colgroup, tableWidth, tableMinWidth } = createColGroup(node, 25) as any;
    const style = tableWidth ? `width: ${tableWidth}` : `min-width: ${tableMinWidth}`;
    const userStyle = node.attrs.style || "";
    const combinedStyle = userStyle ? `${userStyle}; ${style}` : style;

    return ["table", { style: combinedStyle, class: "ark-table" }, colgroup, ["tbody", 0]];
  },
};

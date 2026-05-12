import type { NodeSpec } from "@arkpad/core";
import { NodeRole } from "@arkpad/core";
import type { TableCellAttrs } from "../types";
import { parseCellAttrs, renderCellAttrs } from "./table-cell";

export const tableHeaderNode: NodeSpec = {
  content: "block+",
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  },
  tableRole: "header_cell",
  role: NodeRole.LAYOUT,
  isolating: true,
  parseDOM: [{ tag: "th", getAttrs: parseCellAttrs }],
  toDOM(node) {
    return renderCellAttrs(node.attrs as TableCellAttrs, "th");
  },
};

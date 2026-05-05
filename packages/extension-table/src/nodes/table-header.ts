import type { NodeSpec } from "prosemirror-model";
import type { TableCellAttrs } from "../types";
import { parseCellAttrs, renderCellAttrs } from "./table-cell";

export const tableHeaderNode: NodeSpec = {
  content: "paragraph+",
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  },
  tableRole: "header_cell",
  isolating: true,
  parseDOM: [{ tag: "th", getAttrs: parseCellAttrs }],
  toDOM(node) {
    return renderCellAttrs(node.attrs as TableCellAttrs, "th");
  },
};

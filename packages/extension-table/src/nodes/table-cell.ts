import type { NodeSpec } from "prosemirror-model";
import type { TableCellAttrs } from "../types";

export function parseCellAttrs(dom: HTMLElement): Partial<TableCellAttrs> {
  return {
    colspan: parseInt(dom.getAttribute("colspan") || "1", 10),
    rowspan: parseInt(dom.getAttribute("rowspan") || "1", 10),
    colwidth: dom.getAttribute("data-colwidth")
      ? dom.getAttribute("data-colwidth")!.split(",").map((v) => parseInt(v, 10))
      : null,
    background: dom.style.backgroundColor || null,
  };
}

export function renderCellAttrs(attrs: TableCellAttrs, tag: string): [string, Record<string, any>, number] {
  const domAttrs: Record<string, any> = {};
  if (attrs.colspan !== 1) domAttrs.colspan = attrs.colspan;
  if (attrs.rowspan !== 1) domAttrs.rowspan = attrs.rowspan;
  if (attrs.colwidth) domAttrs["data-colwidth"] = attrs.colwidth.join(",");
  if (attrs.background) domAttrs.style = `background-color: ${attrs.background}`;

  return [tag, domAttrs, 0];
}

export const tableCellNode: NodeSpec = {
  content: "paragraph+",
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  },
  tableRole: "cell",
  isolating: true,
  parseDOM: [{ tag: "td", getAttrs: parseCellAttrs }],
  toDOM(node) {
    return renderCellAttrs(node.attrs as TableCellAttrs, "td");
  },
};

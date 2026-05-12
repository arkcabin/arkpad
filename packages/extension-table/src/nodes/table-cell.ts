import type { NodeSpec, DOMOutputSpec } from "@arkpad/core";
import { NodeRole } from "@arkpad/core";
import type { TableCellAttrs } from "../types";

export function parseCellAttrs(dom: any): Partial<TableCellAttrs> | null {
  if (typeof dom === "string") return null;
  return {
    colspan: parseInt(dom.getAttribute("colspan") || "1", 10),
    rowspan: parseInt(dom.getAttribute("rowspan") || "1", 10),
    colwidth: dom.getAttribute("data-colwidth")
      ? dom
          .getAttribute("data-colwidth")!
          .split(",")
          .map((v: string) => parseInt(v, 10))
      : null,
    background: dom.style.backgroundColor || null,
  };
}

export function renderCellAttrs(attrs: TableCellAttrs, tag: string): DOMOutputSpec {
  const domAttrs: Record<string, any> = {};
  if (attrs.colspan !== 1) domAttrs.colspan = attrs.colspan;
  if (attrs.rowspan !== 1) domAttrs.rowspan = attrs.rowspan;
  if (attrs.colwidth) domAttrs["data-colwidth"] = attrs.colwidth.join(",");
  if (attrs.background) domAttrs.style = `background-color: ${attrs.background}`;

  return [tag, domAttrs, 0];
}

export const tableCellNode: NodeSpec = {
  content: "block+",
  attrs: {
    colspan: { default: 1 },
    rowspan: { default: 1 },
    colwidth: { default: null },
    background: { default: null },
  },
  tableRole: "cell",
  role: NodeRole.LAYOUT,
  isolating: true,
  parseDOM: [{ tag: "td", getAttrs: parseCellAttrs }],
  toDOM(node) {
    return renderCellAttrs(node.attrs as TableCellAttrs, "td");
  },
};

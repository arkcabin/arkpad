import type { PMNode as ProseMirrorNode, PMNodeView as NodeView } from "@arkpad/core";
import { updateColumnsOnResize } from "@arkpad/core";

/**
 * Custom TableView that is compatible with prosemirror-tables' columnResizing plugin.
 *
 * Uses `updateColumnsOnResize` from prosemirror-tables directly so that
 * the columnResizing plugin can pass overrideCol/overrideValue during drag
 * and the DOM stays in sync.
 */
export class TableView implements NodeView {
  node: ProseMirrorNode;
  cellMinWidth: number;
  dom: HTMLDivElement;
  table: HTMLTableElement;
  colgroup: HTMLTableColElement;
  contentDOM: HTMLTableSectionElement;

  constructor(node: ProseMirrorNode, cellMinWidth: number) {
    this.node = node;
    this.cellMinWidth = cellMinWidth;

    this.dom = document.createElement("div");
    this.dom.className = "tableWrapper";

    this.table = this.dom.appendChild(document.createElement("table"));
    this.table.className = "ark-table";

    if (node.attrs.style) {
      this.table.style.cssText = node.attrs.style;
    }

    this.colgroup = this.table.appendChild(document.createElement("colgroup")) as any;

    updateColumnsOnResize(node, this.colgroup, this.table, cellMinWidth);

    this.contentDOM = this.table.appendChild(document.createElement("tbody")) as any;
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    updateColumnsOnResize(node, this.colgroup, this.table, this.cellMinWidth);
    return true;
  }

  ignoreMutation(mutation: any) {
    return (
      mutation.type === "attributes" &&
      (mutation.target === this.dom ||
        mutation.target === this.table ||
        this.colgroup.contains(mutation.target))
    );
  }
}

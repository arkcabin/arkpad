import type { Node as ProseMirrorNode } from "prosemirror-model";
import type { NodeView } from "prosemirror-view";
import { getColStyleDeclaration } from "./utilities/colStyle";

export function updateColumns(
  node: ProseMirrorNode,
  colgroup: HTMLTableColElement,
  table: HTMLTableElement,
  cellMinWidth: number,
  overrideCol?: number,
  overrideValue?: number,
  savedColWidths?: number[]
) {
  let totalWidth = 0;
  let fixedWidth = true;
  let nextDOM = colgroup.firstChild as HTMLElement;
  const row = node.firstChild;

  const isResizing = overrideCol !== undefined;

  if (row !== null) {
    // Map column index to its effective width
    for (let i = 0, col = 0; i < row.childCount; i += 1) {
      const child = row.child(i);
      const { colspan, colwidth } = child.attrs;

      for (let j = 0; j < colspan; j += 1, col += 1) {
        const hasWidth =
          overrideCol === col ? overrideValue : colwidth && (colwidth[j] as number | undefined);
        let effectiveWidth = hasWidth;

        if (!hasWidth) {
          if (isResizing) {
            if (savedColWidths && savedColWidths[col]) {
              effectiveWidth = savedColWidths[col];
            } else {
              // Measure the actual DOM width
              let measured = 0;
              const domCol = colgroup.children[col] as HTMLElement;
              if (domCol && domCol.getBoundingClientRect().width > 0) {
                measured = domCol.getBoundingClientRect().width;
              }

              if (measured <= 0 && table.rows[0]) {
                // Find the cell that actually corresponds to this column
                let currentColumn = 0;
                for (let cellIdx = 0; cellIdx < table.rows[0].cells.length; cellIdx++) {
                  const cell = table.rows[0].cells[cellIdx];
                  if (!cell) continue;

                  const cellColSpan = cell.colSpan || 1;
                  if (currentColumn <= col && col < currentColumn + cellColSpan) {
                    measured = cell.getBoundingClientRect().width / cellColSpan;
                    break;
                  }
                  currentColumn += cellColSpan;
                }
              }

              effectiveWidth = measured > 0 ? measured : Math.max(cellMinWidth, 100);
              if (savedColWidths) savedColWidths[col] = effectiveWidth;
            }
          } else {
            fixedWidth = false;
            effectiveWidth = Math.max(cellMinWidth, 100);
          }
        } else if (savedColWidths) {
          savedColWidths[col] = effectiveWidth;
        }

        totalWidth += effectiveWidth;
        const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, effectiveWidth);

        if (!nextDOM) {
          const colElement = document.createElement("col");
          colElement.style.setProperty(propertyKey, propertyValue);
          colgroup.appendChild(colElement);
        } else {
          const colElement = nextDOM as HTMLTableColElement;
          if (colElement.style.getPropertyValue(propertyKey) !== propertyValue) {
            colElement.style.removeProperty(propertyKey === "width" ? "min-width" : "width");
            colElement.style.setProperty(propertyKey, propertyValue);
          }
          nextDOM = nextDOM.nextSibling as HTMLElement;
        }
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling as HTMLElement;
    nextDOM.parentNode?.removeChild(nextDOM);
    nextDOM = after;
  }

  // Notion Style: Tables should be able to expand beyond their container if columns are wide
  // We use table-layout: fixed to ensure colgroup widths are respected strictly.
  table.style.tableLayout = "fixed";

  if (fixedWidth) {
    table.style.width = `${totalWidth}px`;
    table.style.minWidth = "";
  } else {
    // If some columns are auto, we use 100% width but respect min-widths of fixed columns
    table.style.width = "100%";
    table.style.minWidth = `${totalWidth}px`;
  }
}

export class TableView implements NodeView {
  node: ProseMirrorNode;
  cellMinWidth: number;
  dom: HTMLDivElement;
  table: HTMLTableElement;
  colgroup: HTMLTableColElement;
  contentDOM: HTMLTableSectionElement;
  savedColWidths: number[] = [];

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
    updateColumns(
      node,
      this.colgroup,
      this.table,
      cellMinWidth,
      undefined,
      undefined,
      this.savedColWidths
    );
    this.contentDOM = this.table.appendChild(document.createElement("tbody")) as any;
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;

    // Performance: If we are currently resizing via direct DOM mutation,
    // skip the heavy re-render of the colgroup to prevent jitter.
    if (this.dom.classList.contains("resizing")) {
      return true;
    }

    updateColumns(
      node,
      this.colgroup,
      this.table,
      this.cellMinWidth,
      undefined,
      undefined,
      this.savedColWidths
    );

    return true;
  }

  /**
   * Directly updates a column's width in the DOM for high-performance resizing.
   * Bypasses the ProseMirror transaction loop during the drag.
   */
  public setColumnWidth(colIndex: number, width: number) {
    const col = this.colgroup.children[colIndex] as HTMLTableColElement;
    if (!col) return;

    const minWidth = this.cellMinWidth || 25;
    const effectiveWidth = Math.max(width, minWidth);

    // 1. Update the <col> element directly
    col.style.width = `${effectiveWidth}px`;
    col.style.minWidth = ""; // Ensure we don't have conflicting constraints
    this.savedColWidths[colIndex] = effectiveWidth;

    // 2. Recalculate and update the total table width using the internal cache
    const totalWidth = this.savedColWidths.reduce((sum, w) => sum + (w || 100), 0);

    this.table.style.width = `${totalWidth}px`;
    this.table.style.minWidth = "";
    this.table.style.tableLayout = "fixed";
  }

  ignoreMutation(mutation: any) {
    const target = mutation.target as Node;
    const isInsideWrapper = this.dom.contains(target);
    const isInsideContent = this.contentDOM.contains(target);

    if (isInsideWrapper && !isInsideContent) {
      if (
        mutation.type === "attributes" ||
        mutation.type === "childList" ||
        mutation.type === "characterData"
      ) {
        return true;
      }
    }

    return false;
  }
}

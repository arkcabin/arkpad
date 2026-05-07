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
    for (let i = 0, col = 0; i < row.childCount; i += 1) {
      const { colspan, colwidth } = row.child(i).attrs;

      for (let j = 0; j < colspan; j += 1, col += 1) {
        const hasWidth = overrideCol === col ? overrideValue : (colwidth && (colwidth[j] as number | undefined));
        let effectiveWidth = hasWidth;

        if (!hasWidth) {
          fixedWidth = false;

          if (savedColWidths && savedColWidths[col]) {
            effectiveWidth = savedColWidths[col];
          } else if (isResizing && savedColWidths) {
            let measured = 0;
            if (table.rows && table.rows.length > 0) {
              for (let r = table.rows.length - 1; r >= 0; r--) {
                const domRow = table.rows[r];
                if (!domRow || !domRow.cells) continue;
                let hasColspan = false;
                for (let c = 0; c < domRow.cells.length; c++) {
                  const domCell = domRow.cells[c];
                  if (domCell && domCell.colSpan > 1) hasColspan = true;
                }
                const targetCell = domRow.cells[col];
                if (!hasColspan && targetCell) {
                  measured = targetCell.getBoundingClientRect().width;
                  break;
                }
              }
            }
            if (measured === 0 && colgroup && colgroup.children) {
              const targetCol = colgroup.children[col];
              if (targetCol) {
                measured = targetCol.getBoundingClientRect().width;
              }
            }
            if (measured > 0) {
              savedColWidths[col] = measured;
              effectiveWidth = measured;
            } else {
              effectiveWidth = Math.max(cellMinWidth, 100);
              savedColWidths[col] = effectiveWidth;
            }
          } else {
            effectiveWidth = Math.max(cellMinWidth, 100);
          }
        }

        totalWidth += effectiveWidth || Math.max(cellMinWidth, 100);

        const cssWidth = effectiveWidth ? `${effectiveWidth}px` : "";

        if (!nextDOM) {
          const colElement = document.createElement("col");

          const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, effectiveWidth);

          colElement.style.setProperty(propertyKey, propertyValue);

          colgroup.appendChild(colElement);
        } else {
          if ((nextDOM as HTMLTableColElement).style.width !== cssWidth) {
            const [propertyKey, propertyValue] = getColStyleDeclaration(cellMinWidth, effectiveWidth);

            (nextDOM as HTMLTableColElement).style.setProperty(propertyKey, propertyValue);
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

  const hasUserWidth = node.attrs.style && typeof node.attrs.style === "string" && /\bwidth\s*:/i.test(node.attrs.style);

  if (fixedWidth && !hasUserWidth) {
    table.style.width = `${totalWidth}px`;
    table.style.minWidth = "";
  } else {
    table.style.width = "";
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
    updateColumns(node, this.colgroup, this.table, cellMinWidth, undefined, undefined, this.savedColWidths);
    this.contentDOM = this.table.appendChild(document.createElement("tbody")) as any;
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false;
    }

    this.node = node;
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth, undefined, undefined, this.savedColWidths);

    return true;
  }

  ignoreMutation(mutation: any) {
    const target = mutation.target as Node;
    const isInsideWrapper = this.dom.contains(target);
    const isInsideContent = this.contentDOM.contains(target);

    if (isInsideWrapper && !isInsideContent) {
      if (mutation.type === "attributes" || mutation.type === "childList" || mutation.type === "characterData") {
        return true;
      }
    }

    return false;
  }
}

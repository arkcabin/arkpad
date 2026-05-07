import { Extension } from "@arkpad/core";
import { tableEditing, columnResizing, isInTable, CellSelection, TableMap } from "prosemirror-tables";
import { Plugin, Selection } from "prosemirror-state";
import { Slice, Fragment } from "prosemirror-model";

// Nodes
import { tableNode } from "./nodes/table";
import { tableRowNode } from "./nodes/table-row";
import { tableCellNode } from "./nodes/table-cell";
import { tableHeaderNode } from "./nodes/table-header";
import { TableView } from "./nodes/TableView";

// Commands
import {
  insertTable,
  deleteTable,
  exitTable,
  fixTables,
  fixTableColumnWidths,
  resizeColumn,
} from "./commands/table";
import { addRowBefore, addRowAfter, deleteRow } from "./commands/row";
import { addColumnBefore, addColumnAfter, deleteColumn } from "./commands/column";
import {
  mergeCells,
  splitCell,
  toggleHeaderColumn,
  toggleHeaderRow,
  toggleHeaderCell,
  setCellAttr,
  setCellBackground,
  goToNextCell,
} from "./commands/cell";

// Keyboard
import { keyboardShortcuts } from "./keyboard";

// Utils
import { parseHTMLTable, parseTableData, createTableFromData } from "./utilities/parsePaste";

export * from "./types";

export interface TableOptions {
  resizable: boolean;
  handleWidth: number;
  cellMinWidth: number;
  lastColumnResizable: boolean;
}

export const Table = Extension.create<TableOptions>({
  name: "table",

  addOptions() {
    return {
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 25,
      lastColumnResizable: true,
    };
  },

  addStorage() {
    return {
      resizing: false,
      resizingCol: -1,
    };
  },

  addNodes() {
    return {
      table: tableNode,
      table_row: tableRowNode,
      table_cell: tableCellNode,
      table_header: tableHeaderNode,
    };
  },

  addCommands() {
    return {
      insertTable,
      deleteTable,
      exitTable,
      fixTables,
      addRowBefore,
      addRowAfter,
      deleteRow,
      addColumnBefore,
      addColumnAfter,
      deleteColumn,
      mergeCells,
      splitCell,
      toggleHeaderColumn,
      toggleHeaderRow,
      toggleHeaderCell,
      setCellAttr,
      setCellBackground,
      goToNextCell,
      fixTableColumnWidths,
      resizeColumn,
    };
  },

  addKeyboardShortcuts() {
    return keyboardShortcuts;
  },

  addNodeView() {
    return ({ node }: { node: any }) => new TableView(node, this.options.cellMinWidth) as any;
  },

  addProseMirrorPlugins() {
    const plugins: Plugin[] = [];

    if (this.options.resizable) {
      plugins.push(
        columnResizing({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          lastColumnResizable: this.options.lastColumnResizable,
        })
      );
    }

    plugins.unshift(
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              // 1. Handle Resize Handle Click
              const target = event.target as HTMLElement;
              const isResizeHandle = target.classList.contains("column-resize-handle");

              if (isResizeHandle) {
                event.preventDefault();
                event.stopPropagation();

                this.editor.runCommand("lockUI", "table-resizing");
                this.storage.resizing = true;

                const startX = event.clientX;
                let startWidth = 0;

                const tableDOM = target.closest("table");
                const cellDOM = target.closest("td, th");

                if (cellDOM && tableDOM) {
                  // Find actual TableView instance reliably from ProseMirror
                  let actualTableView: any = null;
                  let tablePos = -1;
                  let actualCellPos = -1;
                  
                  try {
                    // 1. Reliable way to find the exact ProseMirror node position of the table and cell
                    const rawCellPos = view.posAtDOM(cellDOM as HTMLElement, 0);
                    const $cellPos = view.state.doc.resolve(rawCellPos);
                    
                    for (let d = $cellPos.depth; d > 0; d--) {
                      const role = $cellPos.node(d).type.spec.tableRole;
                      if (role === "cell" || role === "header_cell") {
                        actualCellPos = $cellPos.before(d);
                      }
                      if (role === "table") {
                        tablePos = $cellPos.before(d);
                        break;
                      }
                    }
                  } catch (e) {
                    console.warn("[Table Resize] Failed to calculate tablePos:", e);
                  }

                  try {
                    // 2. Find actual TableView instance reliably from ProseMirror
                    const pos = view.posAtDOM(tableDOM, 0);
                    const desc = (view as any).docView.descendantAndContextAt(pos);
                    if (desc && desc.nodeView) actualTableView = desc.nodeView;
                  } catch {
                    // Fallback mechanism if ProseMirror internals change
                  }

                  const firstRow = tableDOM.querySelector("tr");
                  if (firstRow) {
                    // Lock all columns first to prevent auto-shifts
                    const columnWidths: number[] = [];
                    const cells = Array.from(firstRow.children) as HTMLElement[];

                    cells.forEach((cell) => {
                      const rect = cell.getBoundingClientRect();
                      const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
                      const widthPerColumn = rect.width / colspan;
                      for (let i = 0; i < colspan; i++) {
                        columnWidths.push(widthPerColumn);
                      }
                    });

                    this.editor.runCommand("fixTableColumnWidths", columnWidths, tablePos);

                    // Sync the internal cache of the TableView immediately 
                    if (actualTableView) {
                      actualTableView.savedColWidths = [...columnWidths];
                    }

                    // Calculate the exact mathematical column index using TableMap
                    if (tablePos !== -1 && actualCellPos !== -1) {
                      try {
                        // Offset must be relative to the start of the table node
                        const cellPosInsideTable = actualCellPos - tablePos;
                        const tableNode = view.state.doc.nodeAt(tablePos);
                        if (tableNode) {
                          const map = TableMap.get(tableNode);
                          const cellRect = map.findCell(cellPosInsideTable);
                          this.storage.resizingCol = cellRect.right - 1;
                          
                          // Safely get the startWidth directly from ProseMirror attributes to avoid CSS interference
                          const cellNode = view.state.doc.nodeAt(actualCellPos);
                          if (cellNode && cellNode.attrs.colwidth) {
                            const widths = cellNode.attrs.colwidth;
                            startWidth = widths[widths.length - 1];
                          }
                        }
                      } catch(e) {
                        console.warn("[Table Resize] Failed to calculate colIndex using TableMap", e);
                      }
                    }

                    // Fallback DOM calculation if TableMap failed
                    if (this.storage.resizingCol === -1) {
                      let prev = cellDOM.previousElementSibling;
                      let idx = 0;
                      while (prev) {
                        idx += parseInt(prev.getAttribute("colspan") || "1", 10);
                        prev = prev.previousElementSibling;
                      }
                      const colspan = parseInt(cellDOM.getAttribute("colspan") || "1", 10);
                      this.storage.resizingCol = idx + colspan - 1;
                    }

                    // Fallback startWidth calculation
                    if (!startWidth || startWidth === 0) {
                      const colElements = tableDOM.querySelectorAll("col");
                      const colEl = colElements.item(this.storage.resizingCol);
                      if (colEl) {
                        startWidth = parseInt(colEl.getAttribute("width") || "0", 10);
                      }
                      
                      // Absolute last resort
                      if (!startWidth || startWidth === 0) {
                        const rect = cellDOM.getBoundingClientRect();
                        const colspan = parseInt((cellDOM as HTMLElement).getAttribute("colspan") || "1", 10);
                        startWidth = rect.width / colspan;
                      }
                    }

                    
                    if (this.storage.resizingCol === -1) {
                      this.storage.resizing = false;
                      this.editor.runCommand("unlockUI", "table-resizing");
                      return true;
                    }

                    const tableWrapper = tableDOM.parentElement;
                    if (tableWrapper) tableWrapper.classList.add("resizing");

                    // Create the visual guide line
                    const guideLine = document.createElement("div");
                    guideLine.className = "ark-table-resize-guide";
                    
                    // Position it relative to the tableWrapper, accounting for horizontal scroll
                    const wrapperRect = tableWrapper?.getBoundingClientRect();
                    const handleRect = target.getBoundingClientRect();
                    const scrollLeft = tableWrapper ? tableWrapper.scrollLeft : 0;
                    const initialLeft = wrapperRect ? handleRect.right - wrapperRect.left + scrollLeft : 0;
                    
                    console.log("[Resize Start]", {
                      colIndex: this.storage.resizingCol,
                      startWidth,
                      wrapperRect: wrapperRect ? { left: wrapperRect.left, right: wrapperRect.right } : null,
                      handleRect: { left: handleRect.left, right: handleRect.right },
                      scrollLeft,
                      initialLeft,
                      tablePos
                    });

                    guideLine.style.left = `${initialLeft}px`;
                    if (tableWrapper) tableWrapper.appendChild(guideLine);

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const currentX = moveEvent.clientX;
                      const diff = currentX - startX;
                      
                      // Enforce minimum width visually
                      const minDiff = this.options.cellMinWidth - startWidth;
                      const actualDiff = Math.max(minDiff, diff);
                      
                      const newLeft = initialLeft + actualDiff;
                      console.log("[Resize Drag]", { currentX, diff, actualDiff, newLeft });
                      
                      // Move the guide line
                      guideLine.style.left = `${newLeft}px`;
                    };

                    const onMouseUp = (moveEvent: MouseEvent) => {
                      this.editor.runCommand("unlockUI", "table-resizing");
                      if (tableWrapper) {
                        tableWrapper.classList.remove("resizing");
                        if (guideLine.parentNode === tableWrapper) {
                          tableWrapper.removeChild(guideLine);
                        }
                      }

                      // Calculate final width and apply it
                      const currentX = moveEvent.clientX;
                      const diff = currentX - startX;
                      const newWidth = Math.max(this.options.cellMinWidth, startWidth + diff);

                      console.log("[Resize End]", { 
                        colIndex: this.storage.resizingCol, 
                        diff, 
                        newWidth,
                        tablePos 
                      });

                      this.editor.runCommand("resizeColumn", this.storage.resizingCol, newWidth, tablePos);

                      this.storage.resizing = false;
                      this.storage.resizingCol = -1;
                      window.removeEventListener("mousemove", onMouseMove);
                      window.removeEventListener("mouseup", onMouseUp);
                    };

                    window.addEventListener("mousemove", onMouseMove);
                    window.addEventListener("mouseup", onMouseUp);
                  }
                }

                return true;
              }

              // 2. Handle Custom Cell Selection (Cmd/Ctrl + Click)
              if (event.ctrlKey || event.metaKey) {
                const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
                if (!pos) return false;

                const { selection } = view.state;
                const $pos = view.state.doc.resolve(pos.pos);

                for (let d = $pos.depth; d > 0; d--) {
                  const node = $pos.node(d);
                  if (node.type.name === "table_cell" || node.type.name === "table_header") {
                    const cellPos = $pos.before(d);

                    if (selection instanceof CellSelection) {
                      const isSameCell =
                        selection.$anchorCell.pos === cellPos &&
                        selection.$headCell.pos === cellPos;
                      if (isSameCell) {
                        const tr = view.state.tr.setSelection(
                          Selection.near(view.state.doc.resolve(pos.pos))
                        );
                        view.dispatch(tr);
                      } else {
                        const newSelection = new CellSelection(
                          selection.$anchorCell,
                          view.state.doc.resolve(cellPos)
                        );
                        view.dispatch(view.state.tr.setSelection(newSelection));
                      }
                    } else {
                      const newSelection = CellSelection.create(view.state.doc, cellPos);
                      view.dispatch(view.state.tr.setSelection(newSelection));
                    }
                    event.preventDefault();
                    return true;
                  }
                }
              }

              // 3. Allow Standard Text Selection (return false)
              return false;
            },
            mouseover: (view) => {
              if (isInTable(view.state)) {
                // Block prosemirror-tables drag-selection behavior
                return true;
              }
              return false;
            },
            dragstart: (view, event) => {
              if (view.state.selection instanceof CellSelection) {
                event.preventDefault();
                return true;
              }
              return false;
            },
            drop: (view, event) => {
              if (view.state.selection instanceof CellSelection) {
                event.preventDefault();
                return true;
              }
              return false;
            },
            handlePaste: (view, event: ClipboardEvent) => {
              if (isInTable(view.state)) return false;

              const html = event.clipboardData?.getData("text/html");
              const text = event.clipboardData?.getData("text/plain");

              if (html && html.includes("<table")) {
                const fragment = parseHTMLTable(html, view.state.schema);
                if (fragment) {
                  view.dispatch(view.state.tr.replaceSelection(new Slice(fragment, 0, 0)));
                  return true;
                }
              }

              if (text && (text.includes("\t") || text.includes(","))) {
                const data = parseTableData(text);
                if (data.length > 0 && data[0] && data[0].length > 1) {
                  const tableNode = createTableFromData(view.state.schema, data);
                  if (tableNode) {
                    view.dispatch(
                      view.state.tr.replaceSelection(new Slice(Fragment.from(tableNode), 0, 0))
                    );
                    return true;
                  }
                }
              }
              return false;
            },
            handleKeyDown: (view, event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "c") {
                const { selection } = view.state;
                if (selection.empty) return false;
                if (isInTable(view.state) && selection.$from.parent === selection.$to.parent) {
                  return false;
                }
              }
              return false;
            },
          },
        },
      })
    );

    plugins.push(tableEditing());
    return plugins;
  },
});

export default Table;

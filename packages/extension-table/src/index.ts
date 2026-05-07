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

    // Our custom plugin must be FIRST so it intercepts events before prosemirror-tables
    plugins.unshift(
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              // ── 1. RESIZE HANDLE CLICK ─────────────────────────────────────────
              const target = event.target as HTMLElement;
              const isResizeHandle = target.classList.contains("column-resize-handle");

              if (isResizeHandle) {
                event.preventDefault();
                event.stopPropagation();

                this.editor.runCommand("lockUI", "table-resizing");
                this.storage.resizing = true;

                const startX = event.clientX;
                let startWidth = 0;

                const tableDOM = target.closest("table") as HTMLTableElement | null;
                const cellDOM = target.closest("td, th") as HTMLTableCellElement | null;

                if (cellDOM && tableDOM) {
                  let actualTableView: TableView | null = null;
                  let tablePos = -1;
                  let actualCellPos = -1;

                  // ── Step 1: Resolve absolute ProseMirror positions ────────────
                  try {
                    const rawPos = view.posAtDOM(cellDOM, 0);
                    const $pos = view.state.doc.resolve(rawPos);

                    for (let d = $pos.depth; d > 0; d--) {
                      const role = $pos.node(d).type.spec.tableRole;
                      if ((role === "cell" || role === "header_cell") && actualCellPos === -1) {
                        actualCellPos = $pos.before(d);
                      }
                      if (role === "table") {
                        tablePos = $pos.before(d);
                        break;
                      }
                    }
                  } catch {
                    // pos resolution failed — bail out gracefully
                  }

                  // ── Step 2: Locate the TableView instance ─────────────────────
                  try {
                    const pos = view.posAtDOM(tableDOM, 0);
                    const desc = (view as any).docView.descendantAndContextAt(pos);
                    if (desc?.nodeView) actualTableView = desc.nodeView as TableView;
                  } catch {
                    // Internal PM API unavailable — live without TableView reference
                  }

                  // ── Step 3: Snapshot all column widths from the live DOM ───────
                  // This "locks" columns so they don't auto-shift during the drag.
                  const firstRow = tableDOM.querySelector("tr");
                  if (firstRow) {
                    const columnWidths: number[] = [];
                    (Array.from(firstRow.children) as HTMLElement[]).forEach((cell) => {
                      const rect = cell.getBoundingClientRect();
                      const cs = parseInt(cell.getAttribute("colspan") || "1", 10);
                      const perCol = rect.width / cs;
                      for (let i = 0; i < cs; i++) columnWidths.push(perCol);
                    });

                    // Persist snapshot to ProseMirror doc (no undo entry)
                    this.editor.runCommand("fixTableColumnWidths", columnWidths, tablePos);

                    // Sync the TableView cache so setColumnWidth has correct data immediately
                    if (actualTableView) {
                      actualTableView.savedColWidths = [...columnWidths];
                    }

                    // ── Step 4: Calculate column index via TableMap ────────────
                    // TableMap.findCell expects the offset relative to the TABLE NODE's
                    // own content start. The table node starts at tablePos, its content
                    // starts at tablePos + 1. So offset = actualCellPos - tablePos.
                    if (tablePos !== -1 && actualCellPos !== -1) {
                      try {
                        const cellMapOffset = actualCellPos - tablePos;
                        const tableNode = view.state.doc.nodeAt(tablePos);
                        if (tableNode) {
                          const map = TableMap.get(tableNode);
                          const cellRect = map.findCell(cellMapOffset);
                          // cellRect.right - 1 gives us the rightmost 0-based column index
                          this.storage.resizingCol = cellRect.right - 1;

                          // Read startWidth from the PM colwidth attribute
                          // This is the most reliable source — never affected by CSS layout.
                          const cellNode = view.state.doc.nodeAt(actualCellPos);
                          if (cellNode?.attrs.colwidth) {
                            const widths: number[] = cellNode.attrs.colwidth;
                            // subIndex within a colspan cell = resizingCol - cellRect.left
                            const subIndex = this.storage.resizingCol - cellRect.left;
                            const attrWidth = widths[subIndex];
                            if (attrWidth && attrWidth > 0) startWidth = attrWidth;
                          }
                        }
                      } catch {
                        // TableMap lookup failed — fall through to DOM fallback
                      }
                    }

                    // ── Step 5: Fallback column index from DOM ────────────────
                    if (this.storage.resizingCol === -1) {
                      let prev = cellDOM.previousElementSibling;
                      let idx = 0;
                      while (prev) {
                        idx += parseInt(prev.getAttribute("colspan") || "1", 10);
                        prev = prev.previousElementSibling;
                      }
                      const cs = parseInt(cellDOM.getAttribute("colspan") || "1", 10);
                      this.storage.resizingCol = idx + cs - 1;
                    }

                    // ── Step 6: Fallback startWidth from <col> or bounding rect ─
                    if (!startWidth || startWidth <= 0) {
                      const colEl = tableDOM.querySelectorAll("col").item(this.storage.resizingCol);
                      if (colEl) {
                        const w = parseInt(colEl.style.width || colEl.getAttribute("width") || "0", 10);
                        if (w > 0) startWidth = w;
                      }
                    }
                    if (!startWidth || startWidth <= 0) {
                      const rect = cellDOM.getBoundingClientRect();
                      const cs = parseInt(cellDOM.getAttribute("colspan") || "1", 10);
                      startWidth = rect.width / cs;
                    }

                    // Safety check — if we still can't find the column, abort
                    if (this.storage.resizingCol === -1) {
                      this.storage.resizing = false;
                      this.editor.runCommand("unlockUI", "table-resizing");
                      return true;
                    }

                    // ── Step 7: Set up the visual guide line ──────────────────
                    const tableWrapper = tableDOM.parentElement;
                    if (tableWrapper) tableWrapper.classList.add("resizing");

                    const guideLine = document.createElement("div");
                    guideLine.className = "ark-table-resize-guide";

                    // Position the guide at the RIGHT edge of the handle.
                    // All coordinates must be relative to the wrapper's left edge,
                    // taking the wrapper's own horizontal scroll into account.
                    const wrapperRect = tableWrapper?.getBoundingClientRect();
                    const handleRect = target.getBoundingClientRect();
                    const scrollLeft = tableWrapper?.scrollLeft ?? 0;
                    const wrapperLeft = wrapperRect?.left ?? 0;

                    // handleRect.right is viewport-relative; subtract wrapperLeft and
                    // add scrollLeft to convert to wrapper-relative coordinates.
                    const initialLeft = handleRect.right - wrapperLeft + scrollLeft;

                    guideLine.style.left = `${initialLeft}px`;
                    if (tableWrapper) tableWrapper.appendChild(guideLine);

                    // ── Step 8: Mouse move — move guide line only ─────────────
                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const diff = moveEvent.clientX - startX;
                      // Clamp so we can't drag smaller than cellMinWidth
                      const clampedDiff = Math.max(this.options.cellMinWidth - startWidth, diff);
                      guideLine.style.left = `${initialLeft + clampedDiff}px`;
                    };

                    // ── Step 9: Mouse up — commit to ProseMirror ──────────────
                    const onMouseUp = (upEvent: MouseEvent) => {
                      this.editor.runCommand("unlockUI", "table-resizing");

                      if (tableWrapper) {
                        tableWrapper.classList.remove("resizing");
                        if (guideLine.parentNode === tableWrapper) {
                          tableWrapper.removeChild(guideLine);
                        }
                      }

                      const diff = upEvent.clientX - startX;
                      const newWidth = Math.max(this.options.cellMinWidth, startWidth + diff);

                      this.editor.runCommand(
                        "resizeColumn",
                        this.storage.resizingCol,
                        newWidth,
                        tablePos
                      );

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

              // ── 2. CUSTOM CELL SELECTION (Cmd/Ctrl + Click) ───────────────────
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
                        view.dispatch(
                          view.state.tr.setSelection(
                            Selection.near(view.state.doc.resolve(pos.pos))
                          )
                        );
                      } else {
                        view.dispatch(
                          view.state.tr.setSelection(
                            new CellSelection(
                              selection.$anchorCell,
                              view.state.doc.resolve(cellPos)
                            )
                          )
                        );
                      }
                    } else {
                      view.dispatch(
                        view.state.tr.setSelection(CellSelection.create(view.state.doc, cellPos))
                      );
                    }
                    event.preventDefault();
                    return true;
                  }
                }
              }

              // ── 3. ALLOW STANDARD TEXT SELECTION ─────────────────────────────
              return false;
            },

            mouseover: (view) => {
              if (isInTable(view.state)) return true;
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

            handleKeyDown: (_view, event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "c") {
                const { selection } = _view.state;
                if (selection.empty) return false;
                if (isInTable(_view.state) && selection.$from.parent === selection.$to.parent) {
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

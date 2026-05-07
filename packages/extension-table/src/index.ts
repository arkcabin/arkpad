import { Extension } from "@arkpad/core";
import { tableEditing, columnResizing, isInTable, CellSelection } from "prosemirror-tables";
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

    plugins.push(
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              if (!isInTable(view.state)) return false;

              // 1. Handle Resize Handle Click
              const target = event.target as HTMLElement;
              const isResizeHandle = target.classList.contains("column-resize-handle");

              if (isResizeHandle) {
                event.preventDefault();
                event.stopPropagation();

                this.editor.runCommand("lockUI", "table-resizing");
                this.storage.resizing = true;

                let startX = event.clientX;
                let startWidth = 0;

                const tableDOM = target.closest("table");
                const cellDOM = target.closest("td, th");

                if (cellDOM && tableDOM) {
                  // Find actual TableView instance reliably from ProseMirror
                  let actualTableView: any = null;
                  try {
                    const pos = view.posAtDOM(tableDOM, 0);
                    const desc = (view as any).docView.descendantAndContextAt(pos);
                    if (desc && desc.nodeView) actualTableView = desc.nodeView;
                  } catch (e) {
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

                    this.editor.runCommand("fixTableColumnWidths", columnWidths);

                    const cellIndex = cells.indexOf(cellDOM as HTMLElement);
                    let colIndex = 0;
                    for (let i = 0; i < cellIndex; i++) {
                      colIndex += parseInt(cells[i]?.getAttribute("colspan") || "1", 10);
                    }
                    this.storage.resizingCol =
                      colIndex +
                      (parseInt((cellDOM as HTMLElement).getAttribute("colspan") || "1", 10) - 1);

                    const rect = cellDOM.getBoundingClientRect();
                    const colspan = parseInt(
                      (cellDOM as HTMLElement).getAttribute("colspan") || "1",
                      10
                    );
                    startWidth = rect.width / colspan;

                    if (this.storage.resizingCol === -1) {
                      this.storage.resizing = false;
                      this.editor.runCommand("unlockUI", "table-resizing");
                      return true;
                    }

                    // Add 'resizing' class to table wrapper to disable state-driven updates
                    const tableWrapper = tableDOM.parentElement;
                    if (tableWrapper) tableWrapper.classList.add("resizing");

                    const onMouseMove = (moveEvent: MouseEvent) => {
                      const currentX = moveEvent.clientX;
                      const diff = currentX - startX;
                      const newWidth = Math.max(this.options.cellMinWidth, startWidth + diff);

                      // HIGH PERFORMANCE: Update the DOM directly via the TableView
                      if (actualTableView && typeof actualTableView.setColumnWidth === "function") {
                        actualTableView.setColumnWidth(this.storage.resizingCol, newWidth);
                      } else {
                        // Fallback to command if TableView not found
                        this.editor.runCommand("resizeColumn", this.storage.resizingCol, newWidth);
                      }
                    };

                    const onMouseUp = () => {
                      this.editor.runCommand("unlockUI", "table-resizing");
                      if (tableWrapper) tableWrapper.classList.remove("resizing");

                      // Final Sync: Capture the final state from the DOM and save to document
                      if (actualTableView) {
                        const finalWidths = [...actualTableView.savedColWidths];
                        this.editor.runCommand("fixTableColumnWidths", finalWidths);
                      }

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

import { Extension } from "@arkpad/core";
import { tableEditing, columnResizing, isInTable, CellSelection } from "@arkpad/core";
import { Plugin, Selection } from "@arkpad/core";
import { Slice, Fragment } from "@arkpad/core";

// Nodes
import { tableNode } from "./nodes/table";
import { tableRowNode } from "./nodes/table-row";
import { tableCellNode } from "./nodes/table-cell";
import { tableHeaderNode } from "./nodes/table-header";

// Commands
import { insertTable, deleteTable, exitTable, fixTables } from "./commands/table";
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
import { selectColumn, selectRow, selectTable } from "./commands/selection";

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
      selectColumn,
      selectRow,
      selectTable,
    };
  },

  addKeyboardShortcuts() {
    return keyboardShortcuts;
  },

  addProseMirrorPlugins() {
    const plugins: Plugin[] = [];

    // ── 1. Column Resizing (prosemirror-tables handles ALL resize logic) ──
    if (this.options.resizable) {
      plugins.push(
        columnResizing({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          lastColumnResizable: this.options.lastColumnResizable,
        } as Parameters<typeof columnResizing>[0])
      );
    }

    // ── 2. Custom interactions (cell selection, paste, drag prevention) ──
    plugins.push(
      new Plugin({
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              // ── CUSTOM CELL SELECTION (Cmd/Ctrl + Click) ───────────────────
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
                            ) as unknown as Selection
                          )
                        );
                      }
                    } else {
                      view.dispatch(
                        view.state.tr.setSelection(
                          CellSelection.create(view.state.doc, cellPos) as unknown as Selection
                        )
                      );
                    }
                    event.preventDefault();
                    return true;
                  }
                }
              }

              // ── ALLOW STANDARD TEXT SELECTION ─────────────────────────────
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

    // ── 3. Table editing (cell selection, arrow keys, etc.) ──
    plugins.push(tableEditing());
    return plugins;
  },
});

export default Table;

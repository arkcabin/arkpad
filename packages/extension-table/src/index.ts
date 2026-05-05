import { Extension } from "@arkpad/core";
import { tableEditing, columnResizing, isInTable } from "prosemirror-tables";
import { Plugin } from "prosemirror-state";
import { Slice, Fragment } from "prosemirror-model";

// Nodes
import { tableNode } from "./nodes/table";
import { tableRowNode } from "./nodes/table-row";
import { tableCellNode } from "./nodes/table-cell";
import { tableHeaderNode } from "./nodes/table-header";
import { TableView } from "./nodes/TableView";

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
    };
  },

  addKeyboardShortcuts() {
    return keyboardShortcuts;
  },

  addNodeView() {
    return ({ node }) => new TableView(node, this.options.cellMinWidth) as any;
  },

  addProseMirrorPlugins() {
    const plugins = [tableEditing()];

    // Add Paste Handler for HTML Tables and Excel/TSV Data
    plugins.push(
      new Plugin({
        props: {
          handlePaste: (view, event: ClipboardEvent) => {
            // If we're already in a table, let prosemirror-tables handle internal cell paste
            if (isInTable(view.state)) return false;

            const html = event.clipboardData?.getData("text/html");
            const text = event.clipboardData?.getData("text/plain");

            // 1. Handle HTML Table Paste
            if (html && html.includes("<table")) {
              const fragment = parseHTMLTable(html, view.state.schema);
              if (fragment) {
                view.dispatch(view.state.tr.replaceSelection(new Slice(fragment, 0, 0)));
                return true;
              }
            }

            // 2. Handle Excel/TSV/CSV Paste
            if (text && (text.includes("\t") || text.includes(","))) {
              const data = parseTableData(text);
              if (data.length > 0 && data[0] && data[0].length > 1) {
                const tableNode = createTableFromData(view.state.schema, data);
                if (tableNode) {
                  view.dispatch(view.state.tr.replaceSelection(new Slice(Fragment.from(tableNode), 0, 0)));
                  return true;
                }
              }
            }

            return false;
          },
        },
      })
    );

    if (this.options.resizable) {
      plugins.push(
        columnResizing({
          handleWidth: this.options.handleWidth,
          cellMinWidth: this.options.cellMinWidth,
          lastColumnResizable: this.options.lastColumnResizable,
        })
      );
    }

    return plugins;
  },
});

export default Table;

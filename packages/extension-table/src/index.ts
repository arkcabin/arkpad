import { Extension } from "@arkpad/core";
import { tableEditing, columnResizing } from "prosemirror-tables";

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

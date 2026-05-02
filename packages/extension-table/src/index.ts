import { Extension, ArkpadCommandProps } from "@arkpad/core";
import {
  tableEditing,
  columnResizing,
  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  deleteTable,
  mergeCells,
  splitCell,
  toggleHeaderColumn,
  toggleHeaderRow,
  toggleHeaderCell,
  setCellAttr,
  fixTables,
  goToNextCell,
} from "prosemirror-tables";
import { TextSelection } from "prosemirror-state";

export const Table = Extension.create({
  name: "table",

  addOptions() {
    return {
      resizable: false,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    };
  },

  addNodes() {
    return {
      table: {
        content: "table_row+",
        tableRole: "table",
        isolating: true,
        group: "block",
        trailingNode: true,
        parseDOM: [{ tag: "table" }],
        toDOM() {
          return ["table", ["tbody", 0]];
        },
      },
      table_row: {
        content: "(table_cell | table_header)*",
        tableRole: "row",
        parseDOM: [{ tag: "tr" }],
        toDOM() {
          return ["tr", 0];
        },
      },
      table_cell: {
        content: "block+",
        attrs: {
          colspan: { default: 1 },
          rowspan: { default: 1 },
          background: { default: null },
        },
        tableRole: "cell",
        isolating: true,
        parseDOM: [{ tag: "td" }],
        toDOM(node: any) {
          const { colspan, rowspan, background } = node.attrs;
          const attrs: any = {};
          if (colspan !== 1) attrs.colspan = colspan;
          if (rowspan !== 1) attrs.rowspan = rowspan;
          if (background) attrs.style = `background-color: ${background}`;
          return ["td", attrs, 0];
        },
      },
      table_header: {
        content: "block+",
        attrs: {
          colspan: { default: 1 },
          rowspan: { default: 1 },
          background: { default: null },
        },
        tableRole: "header_cell",
        isolating: true,
        parseDOM: [{ tag: "th" }],
        toDOM(node: any) {
          const { colspan, rowspan, background } = node.attrs;
          const attrs: any = {};
          if (colspan !== 1) attrs.colspan = colspan;
          if (rowspan !== 1) attrs.rowspan = rowspan;
          if (background) attrs.style = `background-color: ${background}`;
          return ["th", attrs, 0];
        },
      },
    };
  },

  addCommands() {
    return {
      insertTable:
        ({ rows = 3, cols = 3, withHeaderRow = true } = {}) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, tr }) => {
              const { schema } = state;
              const type = schema.nodes.table;
              if (!type) return false;

              const rowType = schema.nodes.table_row;
              const cellType = schema.nodes.table_cell;
              const headerType = schema.nodes.table_header;

              if (!rowType || !cellType || !headerType) return false;

              const rows_nodes = [];
              for (let i = 0; i < rows; i++) {
                const cells = [];
                for (let j = 0; j < cols; j++) {
                  const cellTypeToUse = withHeaderRow && i === 0 ? headerType : cellType;
                  const cell = cellTypeToUse.createAndFill();
                  if (cell) cells.push(cell);
                }
                const row = rowType.create(null, cells);
                if (row) rows_nodes.push(row);
              }

              const table = type.create(null, rows_nodes);
              tr.replaceSelectionWith(table).scrollIntoView();
              return true;
            }, "insertTable")
            .run();
        },
      addColumnBefore:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addColumnBefore(state, dispatch), "addColumnBefore")
            .run();
        },
      addColumnAfter:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addColumnAfter(state, dispatch), "addColumnAfter")
            .run();
        },
      deleteColumn:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => deleteColumn(state, dispatch), "deleteColumn")
            .run();
        },
      addRowBefore:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addRowBefore(state, dispatch), "addRowBefore")
            .run();
        },
      addRowAfter:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addRowAfter(state, dispatch), "addRowAfter")
            .run();
        },
      deleteRow:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => deleteRow(state, dispatch), "deleteRow")
            .run();
        },
      deleteTable:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => deleteTable(state, dispatch), "deleteTable")
            .run();
        },
      mergeCells:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => mergeCells(state, dispatch), "mergeCells")
            .run();
        },
      splitCell:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => splitCell(state, dispatch), "splitCell")
            .run();
        },
      toggleHeaderColumn:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => toggleHeaderColumn(state, dispatch),
              "toggleHeaderColumn"
            )
            .run();
        },
      toggleHeaderRow:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => toggleHeaderRow(state, dispatch), "toggleHeaderRow")
            .run();
        },
      toggleHeaderCell:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => toggleHeaderCell(state, dispatch), "toggleHeaderCell")
            .run();
        },
      setCellAttr:
        (name: string, value: any) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => setCellAttr(name, value)(state, dispatch),
              "setCellAttr"
            )
            .run();
        },
      fixTables:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => {
              const tr = fixTables(state);
              if (tr && dispatch) {
                dispatch(tr);
                return true;
              }
              return false;
            }, "fixTables")
            .run();
        },
      goToNextCell:
        (direction: number = 1) =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          return goToNextCell(direction as any)(state, dispatch);
        },
      exitTable:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, tr }) => {
              const { selection } = state;
              const { $from } = selection;

              let tablePos = -1;
              for (let d = $from.depth; d > 0; d--) {
                if ($from.node(d).type.spec.tableRole === "table") {
                  tablePos = $from.before(d);
                  break;
                }
              }

              if (tablePos === -1) return false;

              // Use tr.doc to avoid stale positions if the document changed in the same chain
              const tableNode = tr.doc.nodeAt(tablePos)!;
              const endPos = tablePos + tableNode.nodeSize;

              const paragraph = state.schema.nodes.paragraph!.create();
              tr.insert(endPos, paragraph);
              tr.setSelection(TextSelection.create(tr.doc, endPos + 1));
              return true;
            }, "exitTable")
            .scrollIntoView()
            .run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ state, dispatch, editor }: { state: any; dispatch: any; editor: any }) => {
        if (goToNextCell(1)(state, dispatch)) {
          return true;
        }

        // If at the last cell, add a new row and move focus
        if (!editor.canRunCommand("addRowAfter")) {
          return false;
        }

        return editor.chain().addRowAfter().goToNextCell().run();
      },
      "Shift-Tab": ({ state, dispatch }: { state: any; dispatch: any }) =>
        goToNextCell(-1)(state, dispatch),
      "Shift-Enter": ({ editor }: { editor: any }) => editor.runCommand("exitTable"),
    };
  },

  addProseMirrorPlugins() {
    const plugins = [tableEditing()];
    if (this.options.resizable) {
      plugins.push(
        columnResizing({
          handleWidth: 5,
          cellMinWidth: 25,
          lastColumnResizable: this.options.lastColumnResizable,
        })
      );
    }
    return plugins;
  },
});

export default Table;

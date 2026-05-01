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
} from "prosemirror-tables";

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
            })
            .run();
        },
      addColumnBefore:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addColumnBefore(state, dispatch))
            .run();
        },
      addColumnAfter:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addColumnAfter(state, dispatch))
            .run();
        },
      deleteColumn:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => deleteColumn(state, dispatch))
            .run();
        },
      addRowBefore:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addRowBefore(state, dispatch))
            .run();
        },
      addRowAfter:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => addRowAfter(state, dispatch))
            .run();
        },
      deleteRow:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => deleteRow(state, dispatch))
            .run();
        },
      deleteTable:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => deleteTable(state, dispatch))
            .run();
        },
      mergeCells:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => mergeCells(state, dispatch))
            .run();
        },
      splitCell:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => splitCell(state, dispatch))
            .run();
        },
      toggleHeaderColumn:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => toggleHeaderColumn(state, dispatch))
            .run();
        },
      toggleHeaderRow:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => toggleHeaderRow(state, dispatch))
            .run();
        },
      toggleHeaderCell:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => toggleHeaderCell(state, dispatch))
            .run();
        },
      setCellAttr:
        (name: string, value: any) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(({ state, dispatch }) => setCellAttr(name, value)(state, dispatch))
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
            })
            .run();
        },
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

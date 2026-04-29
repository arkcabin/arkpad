import {
  tableNodes,
  columnResizing,
  tableEditing,
  goToNextCell,
  addColumnBefore,
  addColumnAfter,
  deleteColumn,
  addRowBefore,
  addRowAfter,
  deleteRow,
  deleteTable,
  mergeCells,
  splitCell,
  toggleHeaderRow,
  toggleHeaderColumn,
  toggleHeaderCell,
  setCellAttr,
  fixTables,
  TableView,
  CellSelection,
} from "prosemirror-tables";
import { createTable, findTableCell } from "./utils";
import { Extension } from "../Extension";
import { InputRule } from "prosemirror-inputrules";

export const Table = Extension.create({
  name: "table",

  addOptions() {
    return {
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 25,
      lastColumnResizable: true,
      View: TableView,
      allowTableNodeSelection: false,
    };
  },

  addNodes() {
    return tableNodes({
      tableGroup: "block",
      cellContent: "block+",
      cellAttributes: {
        background: {
          default: null,
          getFromDOM(dom: any) {
            return dom.style.backgroundColor || null;
          },
          setDOMAttr(value: any, attrs: any) {
            if (value) {
              attrs.style = (attrs.style || "") + `background-color: ${value};`;
            }
          },
        },
      },
    });
  },

  addCommands() {
    return {
      insertTable:
        ({ rows = 3, cols = 3 } = {}) =>
        (state, dispatch) => {
          const node = createTable(state.schema, rows, cols);
          if (dispatch) {
            dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
          }
          return true;
        },
      addColumnBefore: () => (state, dispatch) => addColumnBefore(state, dispatch),
      addColumnAfter: () => (state, dispatch) => addColumnAfter(state, dispatch),
      deleteColumn: () => (state, dispatch) => deleteColumn(state, dispatch),
      addRowBefore: () => (state, dispatch) => addRowBefore(state, dispatch),
      addRowAfter: () => (state, dispatch) => addRowAfter(state, dispatch),
      deleteRow: () => (state, dispatch) => deleteRow(state, dispatch),
      deleteTable: () => (state, dispatch) => deleteTable(state, dispatch),
      mergeCells: () => (state, dispatch) => mergeCells(state, dispatch),
      splitCell: () => (state, dispatch) => splitCell(state, dispatch),
      toggleHeaderRow: () => (state, dispatch) => toggleHeaderRow(state, dispatch),
      toggleHeaderColumn: () => (state, dispatch) => toggleHeaderColumn(state, dispatch),
      toggleHeaderCell: () => (state, dispatch) => toggleHeaderCell(state, dispatch),
      selectColumn: (index: number) => (state, dispatch) => {
        const { $from } = state.selection;
        const table = findTableCell($from);
        if (!table) return false;

        const tr = state.tr;
        // @ts-expect-error - CellSelection is not in the type definition but exists in JS
        const selection = CellSelection.colSelection(tr.doc.resolve(table.pos), index);
        if (dispatch) dispatch(tr.setSelection(selection));
        return true;
      },
      selectRow: (index: number) => (state, dispatch) => {
        const { $from } = state.selection;
        const table = findTableCell($from);
        if (!table) return false;

        const tr = state.tr;
        // @ts-expect-error - CellSelection is not in the type definition but exists in JS
        const selection = CellSelection.rowSelection(tr.doc.resolve(table.pos), index);
        if (dispatch) dispatch(tr.setSelection(selection));
        return true;
      },
      setCellAttribute: (name: string, value: any) => (state, dispatch) =>
        setCellAttr(name, value)(state, dispatch),
      fixTables: () => (state, dispatch) => {
        const tr = fixTables(state);
        if (tr && dispatch) {
          dispatch(tr);
        }
        return !!tr;
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      columnResizing({
        handleWidth: this.options.handleWidth,
        cellMinWidth: this.options.cellMinWidth,
        lastColumnResizable: this.options.lastColumnResizable,
        View: this.options.View,
      }),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => goToNextCell(1),
      "Shift-Tab": () => goToNextCell(-1),
    };
  },

  addInputRules() {
    return [
      new InputRule(/^\|{2,}\s$/, (state, match, start, end) => {
        if (!state.schema.nodes.table) {
          return null;
        }

        const rows = 3;
        const cols = match[0].trim().length - 1;
        const { tr } = state;
        const table = createTable(state.schema, rows, cols);

        return tr.replaceWith(start, end, table);
      }),
    ];
  },
});

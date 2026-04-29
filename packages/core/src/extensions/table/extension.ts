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
  deleteCellSelection,
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
import { createTable, findTableCell, getCellRect } from "./utils";
import { Extension } from "../Extension";
import { InputRule } from "prosemirror-inputrules";
import { NodeSelection } from "prosemirror-state";

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
      selectColumn: (index?: number) => (state, dispatch) => {
        const rect = getCellRect(state.selection.$from);
        if (!rect) return false;

        const colIndex = index !== undefined ? index : rect.left;
        const tr = state.tr;
        // @ts-expect-error - CellSelection is not in the type definition but exists in JS
        const selection = CellSelection.colSelection(tr.doc.resolve(rect.tablePos), colIndex);
        if (dispatch) dispatch(tr.setSelection(selection));
        return true;
      },
      selectRow: (index?: number) => (state, dispatch) => {
        const rect = getCellRect(state.selection.$from);
        if (!rect) return false;

        const rowIndex = index !== undefined ? index : rect.top;
        const tr = state.tr;
        // @ts-expect-error - CellSelection is not in the type definition but exists in JS
        const selection = CellSelection.rowSelection(tr.doc.resolve(rect.tablePos), rowIndex);
        if (dispatch) dispatch(tr.setSelection(selection));
        return true;
      },
      setCellAttribute: (name: string, value: any) => (state, dispatch) =>
        setCellAttr(name, value)(state, dispatch),
      clearCellContents: () => (state, dispatch) => {
        const { selection, tr, schema } = state;

        if (selection instanceof CellSelection) {
          return deleteCellSelection(state, dispatch);
        }

        const { $from } = selection;
        const cell = findTableCell($from);
        if (cell) {
          if (dispatch) {
            // Replace with a paragraph to satisfy "block+" schema requirement
            dispatch(
              tr.replaceWith(
                cell.pos + 1,
                cell.pos + cell.node.nodeSize - 1,
                schema.nodes.paragraph.createAndFill()!
              )
            );
          }
          return true;
        }

        return false;
      },
      fixTables: () => (state, dispatch) => {
        const tr = fixTables(state);
        if (tr && dispatch) {
          dispatch(tr);
        }
        return !!tr;
      },
      smartDelete: () => (state, dispatch) => {
        const { selection } = state;

        if (selection instanceof CellSelection) {
          if (selection.isRowSelection() && selection.isColSelection()) {
            return deleteTable(state, dispatch);
          }
          if (selection.isRowSelection()) {
            return deleteRow(state, dispatch);
          }
          if (selection.isColSelection()) {
            return deleteColumn(state, dispatch);
          }

          if (dispatch) {
            return this.editor.runCommand("clearCellContents");
          }
          return true;
        }

        // Only delete the table if the table node itself is selected
        if (selection instanceof NodeSelection && selection.node.type.name === "table") {
          return deleteTable(state, dispatch);
        }

        return false;
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
      Backspace: () => this.editor.runCommand("smartDelete"),
      Delete: () => this.editor.runCommand("smartDelete"),
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

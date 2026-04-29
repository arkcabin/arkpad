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
} from "prosemirror-tables";
import { createTable } from "./utils";
import { Extension } from "../Extension";

export const Table = Extension.create({
  name: "table",

  addOptions() {
    return {
      resizable: true,
      handleWidth: 5,
      cellMinWidth: 25,
      lastColumnResizable: true,
      View: null,
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
      addColumnBefore: () => addColumnBefore,
      addColumnAfter: () => addColumnAfter,
      deleteColumn: () => deleteColumn,
      addRowBefore: () => addRowBefore,
      addRowAfter: () => addRowAfter,
      deleteRow: () => deleteRow,
      deleteTable: () => deleteTable,
      mergeCells: () => mergeCells,
      splitCell: () => splitCell,
      toggleHeaderRow: () => toggleHeaderRow,
      toggleHeaderColumn: () => toggleHeaderColumn,
      toggleHeaderCell: () => toggleHeaderCell,
      setCellAttribute: (name: string, value: any) => setCellAttr(name, value),
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
});

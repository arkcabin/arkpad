/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  handlePaste,
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
  TableMap,
} from "prosemirror-tables";
import {
  createTable,
  findTableCell,
  getCellRect,
  getTableMapContext,
  getCellsInRow,
  isAtTableBoundary,
} from "./utils";
import { Extension, type Dispatch } from "@arkpad/shared";
import { type EditorState } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
import { Plugin, NodeSelection, TextSelection } from "prosemirror-state";

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
    const nodes = tableNodes({
      tableGroup: "block",
      cellContent: "block+",
      cellAttributes: {
        background: {
          default: null,
          getFromDOM(dom: HTMLElement) {
            return dom.style.backgroundColor || null;
          },
          setDOMAttr(value: unknown, attrs: Record<string, any>) {
            if (typeof value === "string") {
              attrs.style = (attrs.style || "") + `background-color: ${value};`;
            }
          },
        },
      },
    });

    // Inject A11y & Alignment to Table
    if (nodes.table) {
      nodes.table.attrs = {
        ...(nodes.table.attrs || {}),
        alignment: { default: "left" },
      };

      const originalParseDOM = nodes.table.parseDOM || [];
      nodes.table.parseDOM = [
        {
          tag: "table[data-align]",
          getAttrs: (dom: HTMLElement) => ({
            alignment: dom.getAttribute("data-align") || "left",
          }),
        },
        ...originalParseDOM,
      ];

      const originalTableRender = nodes.table.renderHTML;
      nodes.table.renderHTML = (props: {
        node: { attrs: Record<string, any> };
        HTMLAttributes: Record<string, any>;
      }) => {
        const render = originalTableRender(props);
        if (Array.isArray(render)) {
          const map = TableMap.get(props.node as any);
          render[1] = {
            ...render[1],
            "data-align": props.node.attrs["alignment"],
            role: "grid",
            "aria-rowcount": map.height,
            "aria-colcount": map.width,
          };
        }
        return render;
      };
    }

    // Inject A11y to Row
    if (nodes.table_row) {
      const originalRowRender = nodes.table_row.renderHTML;
      nodes.table_row.renderHTML = (props: {
        node: { attrs: Record<string, any> };
        HTMLAttributes: Record<string, any>;
      }) => {
        const render = originalRowRender(props);
        if (Array.isArray(render)) {
          render[1] = { ...render[1], role: "row" };
        }
        return render;
      };
    }

    // Inject A11y to Cell
    if (nodes.table_cell) {
      const originalCellRender = nodes.table_cell.renderHTML;
      nodes.table_cell.renderHTML = (props: {
        node: { attrs: Record<string, any> };
        HTMLAttributes: Record<string, any>;
      }) => {
        const render = originalCellRender(props);
        if (Array.isArray(render)) {
          render[1] = { ...render[1], role: "gridcell" };
        }
        return render;
      };
    }

    return nodes;
  },

  addCommands() {
    return {
      insertTable:
        ({ rows = 3, cols = 3 } = {}) =>
        (state: EditorState, dispatch?: Dispatch) => {
          const node = createTable(state.schema, rows, cols);
          if (dispatch) {
            dispatch(state.tr.replaceSelectionWith(node).scrollIntoView());
          }
          return true;
        },
      addColumnBefore: () => (state: EditorState, dispatch?: Dispatch) =>
        addColumnBefore(state, dispatch),
      addColumnAfter: () => (state: EditorState, dispatch?: Dispatch) =>
        addColumnAfter(state, dispatch),
      deleteColumn: () => (state: EditorState, dispatch?: Dispatch) =>
        deleteColumn(state, dispatch),
      addRowBefore: () => (state: EditorState, dispatch?: Dispatch) =>
        addRowBefore(state, dispatch),
      addRowAfter: () => (state: EditorState, dispatch?: Dispatch) => addRowAfter(state, dispatch),
      deleteRow: () => (state: EditorState, dispatch?: Dispatch) => deleteRow(state, dispatch),
      deleteTable: () => (state: EditorState, dispatch?: Dispatch) => deleteTable(state, dispatch),
      mergeCells: () => (state: EditorState, dispatch?: Dispatch) => mergeCells(state, dispatch),
      splitCell: () => (state: EditorState, dispatch?: Dispatch) => splitCell(state, dispatch),
      toggleHeaderRow: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleHeaderRow(state, dispatch),
      toggleHeaderColumn: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleHeaderColumn(state, dispatch),
      toggleHeaderCell: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleHeaderCell(state, dispatch),
      selectColumn: (index?: number) => (state: EditorState, dispatch?: Dispatch) => {
        const rect = getCellRect(state.selection.$from);
        if (!rect) return false;

        const colIndex = index !== undefined ? index : rect.left;
        const tr = state.tr;
        // @ts-expect-error - CellSelection is not in the type definition but exists in JS
        const selection = CellSelection.colSelection(tr.doc.resolve(rect.tablePos), colIndex);
        if (dispatch) dispatch(tr.setSelection(selection));
        return true;
      },
      selectRow: (index?: number) => (state: EditorState, dispatch?: Dispatch) => {
        const rect = getCellRect(state.selection.$from);
        if (!rect) return false;

        const rowIndex = index !== undefined ? index : rect.top;
        const tr = state.tr;
        // @ts-expect-error - CellSelection is not in the type definition but exists in JS
        const selection = CellSelection.rowSelection(tr.doc.resolve(rect.tablePos), rowIndex);
        if (dispatch) dispatch(tr.setSelection(selection));
        return true;
      },
      setCellAttribute:
        (name: string, value: unknown) => (state: EditorState, dispatch?: Dispatch) => {
          const { selection, tr } = state;
          if (selection instanceof CellSelection) {
            selection.forEachCell((node, pos) => {
              if (node.attrs[name] !== value) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, [name]: value });
              }
            });
            if (dispatch) dispatch(tr);
            return true;
          }
          return setCellAttr(name, value)(state, dispatch);
        },
      clearCellContents: () => (state: EditorState, dispatch?: Dispatch) => {
        const { selection, tr, schema } = state;

        if (selection instanceof CellSelection) {
          return deleteCellSelection(state, dispatch);
        }

        const { $from } = selection;
        const cell = findTableCell($from);
        if (cell) {
          if (dispatch) {
            const paragraph = schema.nodes.paragraph;
            if (paragraph) {
              // Replace with a paragraph to satisfy "block+" schema requirement
              dispatch(
                tr.replaceWith(
                  cell.pos + 1,
                  cell.pos + cell.node.nodeSize - 1,
                  paragraph.createAndFill()!
                )
              );
            }
          }
          return true;
        }

        return false;
      },
      fixTables: () => (state: EditorState, dispatch?: Dispatch) => {
        const tr = fixTables(state);
        if (tr && dispatch) {
          dispatch(tr);
        }
        return !!tr;
      },
      smartDelete: () => (state: EditorState, dispatch?: Dispatch) => {
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
      setTableAlignment:
        (alignment: "left" | "center" | "right") => (state: EditorState, dispatch?: Dispatch) => {
          const context = getTableMapContext(state.selection.$from);
          if (!context) return false;

          if (dispatch) {
            dispatch(
              state.tr.setNodeMarkup(context.tablePos, undefined, {
                ...context.tableNode.attrs,
                alignment,
              })
            );
          }
          return true;
        },
      setZebraStriping:
        (evenColor: string = "#f8fafc", oddColor: string | null = null) =>
        (state: EditorState, dispatch?: Dispatch) => {
          const context = getTableMapContext(state.selection.$from);
          if (!context) return false;

          const { tr } = state;
          const map = context.map;

          for (let i = 0; i < map.height; i++) {
            // Logic fixed: Row 0 is the 1st row (Odd), Row 1 is the 2nd row (Even)
            const isEven = (i + 1) % 2 === 0;
            const color = isEven ? evenColor : oddColor;
            const cellPositions = getCellsInRow(context.tableStart, context.tableNode, i);

            cellPositions.forEach((pos) => {
              const node = tr.doc.nodeAt(pos);
              if (node && node.attrs.background !== color) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  background: color,
                });
              }
            });
          }

          if (dispatch) dispatch(tr);
          return true;
        },
      toggleHeader: (type: "row" | "column") => (state: EditorState, dispatch?: Dispatch) => {
        const context = getTableMapContext(state.selection.$from);
        if (!context) return false;

        if (type === "row") {
          return toggleHeaderRow(state, dispatch);
        }
        return toggleHeaderColumn(state, dispatch);
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
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some((tr) => tr.docChanged)) return null;
          return fixTables(newState);
        },
      }),
      new Plugin({
        props: {
          handlePaste: (view, event, slice) => {
            // Excel-style "Flood Fill" for CellSelection
            if (view.state.selection instanceof CellSelection && slice.content.childCount === 1) {
              const firstChild = slice.content.firstChild;
              if (
                firstChild &&
                (firstChild.type.name === "table_cell" ||
                  firstChild.type.name === "table_header_cell")
              ) {
                const tr = view.state.tr;
                (view.state.selection as CellSelection).forEachCell((node, pos) => {
                  tr.replaceWith(pos + 1, pos + node.nodeSize - 1, firstChild.content);
                });
                view.dispatch(tr);
                return true;
              }
            }
            return handlePaste(view, event, slice);
          },
        },
      }),
      new Plugin({
        props: {
          handleKeyDown: (view, event) => {
            const { state, dispatch } = view;
            const { selection, tr, schema } = state;

            // Handle Table Escape via Arrows
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              const dir = event.key === "ArrowUp" ? "up" : "down";
              if (isAtTableBoundary(selection.$from, dir)) {
                const context = getTableMapContext(selection.$from);
                if (!context) return false;

                const pos =
                  dir === "up" ? context.tablePos : context.tablePos + context.tableNode.nodeSize;
                const nextNode = tr.doc.nodeAt(pos);

                // If no node exists after/before, or if it's another table, insert a paragraph
                if (!nextNode || nextNode.type.name === "table") {
                  const paragraph = schema.nodes.paragraph;
                  if (!paragraph) return false;

                  tr.insert(pos, paragraph.createAndFill()!);
                  const newSelection = TextSelection.create(tr.doc, pos + 1);
                  tr.setSelection(newSelection);
                  dispatch(tr.scrollIntoView());
                  return true;
                }
              }
            }

            // Handle Table Escape via Enter in empty cell or at end of last cell
            if (event.key === "Enter" && !event.shiftKey) {
              const { $from } = selection;
              const cell = findTableCell($from);
              if (cell) {
                const isAtEnd = $from.parentOffset === $from.parent.content.size;
                const isEmpty = cell.node.textContent.length === 0;

                if ((isEmpty || isAtEnd) && isAtTableBoundary($from, "down")) {
                  const context = getTableMapContext($from);
                  const paragraph = schema.nodes.paragraph;
                  if (context && paragraph) {
                    const pos = context.tablePos + context.tableNode.nodeSize;
                    tr.insert(pos, paragraph.createAndFill()!);
                    tr.setSelection(TextSelection.create(tr.doc, pos + 1));
                    dispatch(tr.scrollIntoView());
                    return true;
                  }
                }
              }
            }

            return false;
          },
        },
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

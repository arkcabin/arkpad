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
  TableMap,
} from "prosemirror-tables";
import { TextSelection } from "prosemirror-state";
import { TableView } from "./TableNodeView";

export const Table = Extension.create({
  name: "table",

  addOptions() {
    return {
      resizable: true,
      lastColumnResizable: true,
      allowTableNodeSelection: false,
    };
  },

  addNodes() {
    return {
      table: {
        content: "table_row+",
        attrs: {
          class: { default: null },
          style: { default: null },
        },
        tableRole: "table",
        isolating: true,
        group: "block",
        trailingNode: true,
        parseDOM: [{ tag: "table" }],
        toDOM(node: any) {
          const { class: className, style } = node.attrs;

          // 1. Determine total column count
          const map = TableMap.get(node);
          const colCount = map.width;

          // 2. Build reactive colgroup
          const colgroup: any[] = ["colgroup"];
          const colWidths = new Array(colCount).fill(0);

          // Find the first row to extract the current column widths
          const firstRow = node.firstChild;
          if (firstRow) {
            let colIdx = 0;
            for (let i = 0; i < firstRow.childCount; i++) {
              const cell = firstRow.child(i);
              const { colspan, colwidth } = cell.attrs;
              for (let j = 0; j < (colspan || 1); j++) {
                if (colwidth && colwidth[j]) {
                  colWidths[colIdx] = colwidth[j];
                }
                colIdx++;
              }
            }
          }

          for (let i = 0; i < colCount; i++) {
            const width = colWidths[i];
            const colStyle = width ? `width: ${width}px;` : "";
            colgroup.push(["col", { style: colStyle }]);
          }

          return [
            "div",
            { class: "tableWrapper" },
            ["table", { class: className, style }, colgroup, ["tbody", 0]],
          ];
        },
      },
      table_row: {
        content: "(table_cell | table_header)*",
        attrs: {
          class: { default: null },
          style: { default: null },
        },
        tableRole: "row",
        parseDOM: [{ tag: "tr" }],
        toDOM(node: any) {
          const { class: className, style } = node.attrs;
          return ["tr", { class: className, style }, 0];
        },
      },
      table_cell: {
        content: "block+",
        attrs: {
          colspan: { default: 1 },
          rowspan: { default: 1 },
          colwidth: { default: null },
          background: { default: null },
          class: { default: null },
          style: { default: null },
        },
        tableRole: "cell",
        isolating: true,
        parseDOM: [
          {
            tag: "td",
            getAttrs: (dom: any) => ({
              colspan: parseInt(dom.getAttribute("colspan") || "1", 10),
              rowspan: parseInt(dom.getAttribute("rowspan") || "1", 10),
              colwidth: dom.getAttribute("data-colwidth")
                ? dom
                    .getAttribute("data-colwidth")
                    .split(",")
                    .map((v: string) => parseInt(v, 10))
                : null,
              class: dom.getAttribute("class"),
              style: dom.getAttribute("style"),
            }),
          },
        ],
        toDOM(node: any) {
          const { colspan, rowspan, colwidth, background, class: className, style } = node.attrs;
          const attrs: any = {};
          if (colspan !== 1) attrs.colspan = colspan;
          if (rowspan !== 1) attrs.rowspan = rowspan;
          if (colwidth) attrs["data-colwidth"] = colwidth.join(",");
          if (className) attrs.class = className;

          let finalStyle = style || "";
          if (background) finalStyle += `background-color: ${background};`;
          if (finalStyle) attrs.style = finalStyle;

          return ["td", attrs, 0];
        },
      },
      table_header: {
        content: "block+",
        attrs: {
          colspan: { default: 1 },
          rowspan: { default: 1 },
          colwidth: { default: null },
          background: { default: null },
          class: { default: null },
          style: { default: null },
        },
        tableRole: "header_cell",
        isolating: true,
        parseDOM: [
          {
            tag: "th",
            getAttrs: (dom: any) => ({
              colspan: parseInt(dom.getAttribute("colspan") || "1", 10),
              rowspan: parseInt(dom.getAttribute("rowspan") || "1", 10),
              colwidth: dom.getAttribute("data-colwidth")
                ? dom
                    .getAttribute("data-colwidth")
                    .split(",")
                    .map((v: string) => parseInt(v, 10))
                : null,
              class: dom.getAttribute("class"),
              style: dom.getAttribute("style"),
            }),
          },
        ],
        toDOM(node: any) {
          const { colspan, rowspan, colwidth, background, class: className, style } = node.attrs;
          const attrs: any = {};
          if (colspan !== 1) attrs.colspan = colspan;
          if (rowspan !== 1) attrs.rowspan = rowspan;
          if (colwidth) attrs["data-colwidth"] = colwidth.join(",");
          if (className) attrs.class = className;

          let finalStyle = style || "";
          if (background) finalStyle += `background-color: ${background};`;
          if (finalStyle) attrs.style = finalStyle;

          return ["th", attrs, 0];
        },
      },
    };
  },

  addNodeView() {
    return (props: any) => new TableView(props);
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
            }, "insertTable: create initial structure")
            .run();
        },
      addColumnBefore:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => addColumnBefore(state, dispatch),
              "addColumnBefore: insert column to the left"
            )
            .run();
        },
      addColumnAfter:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => addColumnAfter(state, dispatch),
              "addColumnAfter: insert column to the right"
            )
            .run();
        },
      deleteColumn:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => deleteColumn(state, dispatch),
              "deleteColumn: remove selected column"
            )
            .run();
        },
      addRowBefore:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => addRowBefore(state, dispatch),
              "addRowBefore: insert row above"
            )
            .run();
        },
      addRowAfter:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => addRowAfter(state, dispatch),
              "addRowAfter: insert row below"
            )
            .run();
        },
      deleteRow:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => deleteRow(state, dispatch),
              "deleteRow: remove selected row"
            )
            .run();
        },
      deleteTable:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => deleteTable(state, dispatch),
              "deleteTable: remove entire table structure"
            )
            .run();
        },
      mergeCells:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => mergeCells(state, dispatch),
              "mergeCells: combine selected cells"
            )
            .run();
        },
      splitCell:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .command(
              ({ state, dispatch }) => splitCell(state, dispatch),
              "splitCell: divide merged cell"
            )
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
            .command(({ state, dispatch }) => {
              return setCellAttr(name, value)(state, dispatch);
            }, "setCellAttr")
            .run();
        },
      setCellBackground:
        (color: string) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().setCellAttr("background", color).run();
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
              return !!tr;
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
            .command(({ state, tr, dispatch }) => {
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

              const tableNode = tr.doc.nodeAt(tablePos)!;
              const endPos = tablePos + tableNode.nodeSize;

              // Check if there is already a paragraph after the table
              const nextNode = tr.doc.nodeAt(endPos);
              if (nextNode && nextNode.type.name === "paragraph") {
                if (dispatch) {
                  dispatch(
                    tr.setSelection(TextSelection.create(tr.doc, endPos + 1)).scrollIntoView()
                  );
                }
                return true;
              }

              const paragraph = state.schema.nodes.paragraph!.create();
              tr.insert(endPos, paragraph);
              tr.setSelection(TextSelection.create(tr.doc, endPos + 1));
              if (dispatch) {
                dispatch(tr.scrollIntoView());
              }
              return true;
            }, "exitTable")
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
          handleWidth: 12, // Match the 12px hitbox in CSS
          cellMinWidth: 50,
          lastColumnResizable: this.options.lastColumnResizable,
        })
      );
    }
    return plugins;
  },
});

export default Table;

import type { ArkpadCommandProps } from "@arkpad/core";
import { TextSelection } from "prosemirror-state";
import { fixTables as pmFixTables, deleteTable as pmDeleteTable } from "prosemirror-tables";
import type { InsertTableOptions, CommandFactory } from "../types";
import { createTable } from "../nodes/utilities/createTable";

export const insertTable: CommandFactory =
  (options: InsertTableOptions = {}) =>
  ({ chain }: ArkpadCommandProps) => {
    const { rows = 3, cols = 3, withHeaderRow = true } = options;
    return chain()
      .command(({ state, tr }) => {
        const { schema } = state;
        const node = createTable(schema, rows, cols, withHeaderRow);

        if (!node) return false;

        const offset = tr.selection.from + 1;
        tr.replaceSelectionWith(node).scrollIntoView();

        const resolvedPos = tr.doc.resolve(offset);
        tr.setSelection(TextSelection.near(resolvedPos));

        return true;
      }, "insertTable")
      .run();
  };

export const deleteTable: CommandFactory =
  () =>
  ({ chain }: ArkpadCommandProps) => {
    return chain()
      .command(
        ({ state, dispatch }: ArkpadCommandProps) => pmDeleteTable(state, dispatch),
        "deleteTable"
      )
      .run();
  };

export const exitTable: CommandFactory =
  () =>
  ({ chain }: ArkpadCommandProps) => {
    return chain()
      .command(({ state, tr, dispatch }: ArkpadCommandProps) => {
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

        const node = tr.doc.nodeAt(tablePos);
        if (!node) return false;

        const after = tablePos + node.nodeSize;
        const nodeAfter = tr.doc.nodeAt(after);

        if (nodeAfter && nodeAfter.type.name === "paragraph") {
          if (dispatch)
            dispatch(tr.setSelection(TextSelection.create(tr.doc, after + 1)).scrollIntoView());
          return true;
        }

        const paragraph = state.schema.nodes.paragraph!.create();
        tr.insert(after, paragraph);
        tr.setSelection(TextSelection.create(tr.doc, after + 1));
        if (dispatch) dispatch(tr.scrollIntoView());

        return true;
      }, "exitTable")
      .run();
  };

export const fixTables: CommandFactory =
  () =>
  ({ chain }: ArkpadCommandProps) => {
    return chain()
      .command(({ state, dispatch }: ArkpadCommandProps) => {
        const tr = pmFixTables(state);
        if (tr && dispatch) {
          dispatch(tr);
          return true;
        }
        return !!tr;
      }, "fixTables")
      .run();
  };

export const fixTableColumnWidths: CommandFactory =
  (widths?: number[], explicitTablePos?: number) =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    let tablePos = explicitTablePos ?? -1;

    if (tablePos === -1) {
      const { selection } = state;
      const { $from } = selection;

      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.spec.tableRole === "table") {
          tablePos = $from.before(d);
          break;
        }
      }
    }

    if (tablePos === -1) return false;

    const table = tr.doc.nodeAt(tablePos);
    if (!table) return false;

    const firstRow = table.firstChild;
    if (!firstRow) return false;

    let currentCol = 0;
    let currentCellPos = tablePos + 2; // table start (1) + first row start (1) = 2

    firstRow.forEach((cell) => {
      const colspan = cell.attrs.colspan || 1;
      const oldColwidth = cell.attrs.colwidth;
      const colwidth = oldColwidth ? [...oldColwidth] : new Array(colspan).fill(0);
      let changed = false;

      for (let j = 0; j < colspan; j++) {
        const width = widths?.[currentCol];
        if (typeof width === "number") {
          const roundedWidth = Math.round(width);
          if (colwidth[j] !== roundedWidth) {
            colwidth[j] = roundedWidth;
            changed = true;
          }
        } else if (!colwidth[j]) {
          colwidth[j] = 100;
          changed = true;
        }
        currentCol++;
      }

      if (changed) {
        tr.setNodeMarkup(currentCellPos, undefined, {
          ...cell.attrs,
          colwidth,
        });
      }

      currentCellPos += cell.nodeSize;
    });

    if (tr.docChanged && dispatch) {
      tr.setMeta("addToHistory", false); // Don't bloat undo history with "lock" transactions
      dispatch(tr);
    }
    return true;
  };

export const resizeColumn: CommandFactory =
  (colIndex: number, width: number, explicitTablePos?: number) =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    let tablePos = explicitTablePos ?? -1;

    if (tablePos === -1) {
      const { selection } = state;
      const { $from } = selection;

      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.spec.tableRole === "table") {
          tablePos = $from.before(d);
          break;
        }
      }
    }

    if (tablePos === -1) return false;

    const table = tr.doc.nodeAt(tablePos);
    if (!table || !table.firstChild) return false;

    const firstRow = table.firstChild;
    let currentCol = 0;
    let currentCellPos = tablePos + 2;
    let found = false;

    firstRow.forEach((cell) => {
      if (found) return;
      const colspan = cell.attrs.colspan || 1;
      if (colIndex >= currentCol && colIndex < currentCol + colspan) {
        const colwidth = cell.attrs.colwidth ? [...cell.attrs.colwidth] : new Array(colspan).fill(0);
        colwidth[colIndex - currentCol] = Math.round(width);

        tr.setNodeMarkup(currentCellPos, undefined, {
          ...cell.attrs,
          colwidth,
        });
        found = true;
      }
      currentCol += colspan;
      currentCellPos += cell.nodeSize;
    });

    if (found && dispatch) {
      tr.setMeta("addToHistory", false);
      dispatch(tr);
      return true;
    }

    return false;
  };

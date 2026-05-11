import type { ArkpadCommandProps } from "@arkpad/core";
import { TextSelection } from "prosemirror-state";
import { deleteTable as pmDeleteTable, TableMap } from "prosemirror-tables";
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
      .command(({ state, tr, dispatch }: ArkpadCommandProps) => {
        let fixed = false;
        const { doc } = state;
        doc.descendants((node, pos) => {
          if (node.type.name === "table") {
            const table = node;
            const map = TableMap.get(table);
            for (let row = 0; row < map.height; row++) {
              for (let col = 0; col < map.width; col++) {
                const cellPos = map.positionAt(row, col, table);
                if (cellPos === -1) continue;
                const cell = doc.nodeAt(pos + 1 + cellPos);
                if (!cell) {
                  return;
                }
                const colspan = cell.attrs.colspan || 1;
                const rowspan = cell.attrs.rowspan || 1;
                if (col + colspan > map.width || row + rowspan > map.height) {
                  const newAttrs = { ...cell.attrs };
                  if (col + colspan > map.width) {
                    newAttrs.colspan = map.width - col;
                  }
                  if (row + rowspan > map.height) {
                    newAttrs.rowspan = map.height - row;
                  }
                  tr.setNodeMarkup(pos + 1 + cellPos, undefined, newAttrs);
                  fixed = true;
                }
              }
            }
          }
        });
        if (fixed && dispatch) {
          dispatch(tr);
          return true;
        }
        return false;
      }, "fixTables")
      .run();
  };

/**
 * Fixes column widths across ALL rows of a table.
 * Uses TableMap to correctly resolve which cells belong to which column,
 * even when cells have colspan or rowspan attributes.
 */
export const fixTableColumnWidths: CommandFactory =
  (widths?: number[], explicitTablePos?: number) =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    let tablePos = explicitTablePos ?? -1;

    if (tablePos === -1) {
      const { $from } = state.selection;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.spec.tableRole === "table") {
          tablePos = $from.before(d);
          break;
        }
      }
    }

    if (tablePos === -1) return false;

    const tableNode = tr.doc.nodeAt(tablePos);
    if (!tableNode) return false;

    const map = TableMap.get(tableNode);
    const seen = new Set<number>();

    // Walk every cell in the table and update its colwidth attr
    for (let i = 0; i < map.map.length; i++) {
      const pos = map.map[i];
      if (pos === undefined || seen.has(pos)) continue;
      seen.add(pos);

      const cellDocPos = tablePos + 1 + pos;
      const cellNode = tr.doc.nodeAt(cellDocPos);

      if (!cellNode) continue;

      const cellRect = map.findCell(pos);
      const colspan = cellNode.attrs.colspan || 1;
      const oldColwidth: number[] = cellNode.attrs.colwidth
        ? [...cellNode.attrs.colwidth]
        : new Array(colspan).fill(0);

      let changed = false;
      for (let j = 0; j < colspan; j++) {
        const col = cellRect.left + j;
        const width = widths?.[col];
        if (typeof width === "number") {
          const rounded = Math.round(width);
          if (oldColwidth[j] !== rounded) {
            oldColwidth[j] = rounded;
            changed = true;
          }
        } else if (!oldColwidth[j]) {
          oldColwidth[j] = 100;
          changed = true;
        }
      }

      if (changed) {
        tr.setNodeMarkup(cellDocPos, undefined, {
          ...cellNode.attrs,
          colwidth: oldColwidth,
        });
      }
    }

    if (tr.docChanged && dispatch) {
      tr.setMeta("addToHistory", false);
      dispatch(tr);
    }
    return true;
  };

/**
 * Resizes a specific column across ALL rows of a table.
 * Uses TableMap to correctly identify which cells belong to the target column,
 * correctly handling colspan and rowspan.
 */
export const resizeColumn: CommandFactory =
  (colIndex: number, width: number, explicitTablePos?: number) =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    let tablePos = explicitTablePos ?? -1;

    if (tablePos === -1) {
      const { $from } = state.selection;
      for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.spec.tableRole === "table") {
          tablePos = $from.before(d);
          break;
        }
      }
    }

    if (tablePos === -1) return false;

    const tableNode = tr.doc.nodeAt(tablePos);
    if (!tableNode) return false;

    const map = TableMap.get(tableNode);
    const roundedWidth = Math.round(width);
    const seen = new Set<number>();
    let found = false;

    // Walk every cell in the table
    for (let i = 0; i < map.map.length; i++) {
      const pos = map.map[i];
      if (pos === undefined || seen.has(pos)) continue;
      seen.add(pos);

      const cellDocPos = tablePos + 1 + pos;
      const cellNode = tr.doc.nodeAt(cellDocPos);

      if (!cellNode) continue;

      const cellRect = map.findCell(pos);

      // Does this cell span across the target column?
      if (colIndex < cellRect.left || colIndex >= cellRect.right) continue;

      const colspan = cellNode.attrs.colspan || 1;
      const colwidth: number[] = cellNode.attrs.colwidth
        ? [...cellNode.attrs.colwidth]
        : new Array(colspan).fill(0);

      const subIndex = colIndex - cellRect.left;
      colwidth[subIndex] = roundedWidth;

      tr.setNodeMarkup(cellDocPos, undefined, {
        ...cellNode.attrs,
        colwidth,
      });
      found = true;
    }

    if (found && dispatch) {
      tr.setMeta("addToHistory", false);
      dispatch(tr);
      return true;
    }

    return false;
  };

import { CellSelection, TableMap } from "@arkpad/core";
import { Selection } from "@arkpad/core";
import type { ArkpadCommandProps } from "@arkpad/core";
import type { CommandFactory } from "../types";

/**
 * Selects a specific column in a table.
 * Handles merged cells correctly by using TableMap.findCell.
 */
export const selectColumn: CommandFactory =
  (index: number) =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    const { selection } = state;
    let tablePos = -1;

    const { $from } = selection;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.spec.tableRole === "table") {
        tablePos = $from.before(d);
        break;
      }
    }

    if (tablePos === -1) return false;

    const table = tr.doc.nodeAt(tablePos);
    if (!table) return false;

    try {
      const map = TableMap.get(table);
      if (index < 0 || index >= map.width) return false;

      // Iterate through all cells in the map to find those in the target column
      // This correctly handles merged cells (colspans) via findCell
      let anchorCell = -1;
      let headCell = -1;
      const seen = new Set<number>();

      for (let i = 0; i < map.map.length; i++) {
        const mapIndex = map.map[i];
        if (mapIndex === undefined || seen.has(mapIndex)) continue;
        seen.add(mapIndex);

        const cellRect = map.findCell(mapIndex);
        if (cellRect.left <= index && index < cellRect.right) {
          const cellPos = tablePos + 1 + mapIndex;
          if (anchorCell === -1) {
            anchorCell = cellPos;
          }
          headCell = cellPos;
        }
      }

      if (anchorCell === -1 || headCell === -1) return false;

      if (dispatch) {
        dispatch(
          tr.setSelection(
            new CellSelection(tr.doc.resolve(anchorCell), tr.doc.resolve(headCell)) as any
          )
        );
      }
      return true;
    } catch {
      return false;
    }
  };

/**
 * Selects a specific row in a table.
 * Handles merged cells correctly by using TableMap.findCell.
 */
export const selectRow: CommandFactory =
  (index: number) =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    const { selection } = state;
    let tablePos = -1;

    const { $from } = selection;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.spec.tableRole === "table") {
        tablePos = $from.before(d);
        break;
      }
    }

    if (tablePos === -1) return false;

    const table = tr.doc.nodeAt(tablePos);
    if (!table) return false;

    try {
      const map = TableMap.get(table);
      if (index < 0 || index >= map.height) return false;

      // Iterate through all cells in the map to find those in the target row
      // This correctly handles merged cells (rowspans) via findCell
      let anchorCell = -1;
      let headCell = -1;
      const seen = new Set<number>();

      for (let i = 0; i < map.map.length; i++) {
        const mapIndex = map.map[i];
        if (mapIndex === undefined || seen.has(mapIndex)) continue;
        seen.add(mapIndex);

        const cellRect = map.findCell(mapIndex);
        if (cellRect.top <= index && index < cellRect.bottom) {
          const cellPos = tablePos + 1 + mapIndex;
          if (anchorCell === -1) {
            anchorCell = cellPos;
          }
          headCell = cellPos;
        }
      }

      if (anchorCell === -1 || headCell === -1) return false;

      if (dispatch) {
        dispatch(
          tr.setSelection(
            new CellSelection(tr.doc.resolve(anchorCell), tr.doc.resolve(headCell)) as any
          )
        );
      }
      return true;
    } catch {
      return false;
    }
  };

/**
 * Selects the entire table.
 */
export const selectTable: CommandFactory =
  () =>
  ({ state, tr, dispatch }: ArkpadCommandProps) => {
    const { selection } = state;
    let tablePos = -1;

    const { $from } = selection;
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.spec.tableRole === "table") {
        tablePos = $from.before(d);
        break;
      }
    }

    if (tablePos === -1) return false;

    const table = tr.doc.nodeAt(tablePos);
    if (!table) return false;

    if (dispatch) {
      dispatch(tr.setSelection(Selection.near(tr.doc.resolve(tablePos), 1)));
    }
    return true;
  };

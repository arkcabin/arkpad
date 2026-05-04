import { EditorState, TextSelection, Selection } from "prosemirror-state";
import { TableMap, CellSelection } from "prosemirror-tables";
import { EditorView } from "prosemirror-view";

/**
 * Finds a table at the current selection.
 */
export function findTable(state: EditorState) {
  const { $anchor } = state.selection;
  for (let d = $anchor.depth; d > 0; d--) {
    const node = $anchor.node(d);
    if (node.type.spec.tableRole === "table") {
      return {
        pos: $anchor.before(d),
        node,
      };
    }
  }
  return null;
}

/**
 * Selects a specific column in a table.
 */
export function selectColumn(view: EditorView, tablePos: number, colIndex: number) {
  const { state, dispatch } = view;
  const table = state.doc.nodeAt(tablePos);
  if (!table || table.type.spec.tableRole !== "table") return;

  const map = TableMap.get(table);
  const anchorCellPos = tablePos + map.map[colIndex]! + 1;
  const headCellPos = tablePos + map.map[colIndex + (map.height - 1) * map.width]! + 1;

  if (isColumnSelected(state, tablePos, colIndex)) {
    // Toggle off: Move selection safely into the cell content
    dispatch(state.tr.setSelection(Selection.near(state.doc.resolve(anchorCellPos))));
  } else {
    dispatch(state.tr.setSelection(CellSelection.create(state.doc, anchorCellPos, headCellPos)));
  }
  view.focus();
}

/**
 * Selects a specific row in a table.
 */
export function selectRow(view: EditorView, tablePos: number, rowIndex: number) {
  const { state, dispatch } = view;
  const table = state.doc.nodeAt(tablePos);
  if (!table || table.type.spec.tableRole !== "table") return;

  const map = TableMap.get(table);
  const anchorCellPos = tablePos + map.map[rowIndex * map.width]! + 1;
  const headCellPos = tablePos + map.map[rowIndex * map.width + map.width - 1]! + 1;

  if (isRowSelected(state, tablePos, rowIndex)) {
    // Toggle off: Move selection safely into the cell content
    dispatch(state.tr.setSelection(Selection.near(state.doc.resolve(anchorCellPos))));
  } else {
    dispatch(state.tr.setSelection(CellSelection.create(state.doc, anchorCellPos, headCellPos)));
  }
  view.focus();
}

/**
 * Selects the entire table.
 */
export function selectTable(view: EditorView, tablePos: number) {
  const { state, dispatch } = view;
  const table = state.doc.nodeAt(tablePos);
  if (!table || table.type.spec.tableRole !== "table") return;

  const map = TableMap.get(table);
  const anchorCellPos = tablePos + map.map[0]! + 1;
  const headCellPos = tablePos + map.map[map.map.length - 1]! + 1;

  if (isTableSelected(state, tablePos)) {
    // Toggle off
    dispatch(state.tr.setSelection(TextSelection.create(state.doc, anchorCellPos + 1)));
  } else {
    dispatch(state.tr.setSelection(CellSelection.create(state.doc, anchorCellPos, headCellPos)));
  }
  view.focus();
}

/**
 * Checks if a specific column is selected.
 */
export function isColumnSelected(state: EditorState, tablePos: number, colIndex: number): boolean {
  const { selection } = state;
  if (!(selection instanceof CellSelection)) return false;

  // Find the table node start
  let tableStart = -1;
  for (let d = selection.$anchorCell.depth; d > 0; d--) {
    if (selection.$anchorCell.node(d).type.spec.tableRole === "table") {
      tableStart = selection.$anchorCell.before(d);
      break;
    }
  }

  if (tableStart === -1 || tableStart !== tablePos) return false;

  const map = TableMap.get(state.doc.nodeAt(tablePos)!);
  const anchorRect = map.findCell(selection.$anchorCell.pos - tableStart - 1);
  const headRect = map.findCell(selection.$headCell.pos - tableStart - 1);

  return (
    Math.min(anchorRect.left, headRect.left) <= colIndex &&
    Math.max(anchorRect.right, headRect.right) >= colIndex + 1 &&
    Math.min(anchorRect.top, headRect.top) === 0 &&
    Math.max(anchorRect.bottom, headRect.bottom) === map.height
  );
}

/**
 * Checks if a specific row is selected.
 */
export function isRowSelected(state: EditorState, tablePos: number, rowIndex: number): boolean {
  const { selection } = state;
  if (!(selection instanceof CellSelection)) return false;

  // Find the table node start
  let tableStart = -1;
  for (let d = selection.$anchorCell.depth; d > 0; d--) {
    if (selection.$anchorCell.node(d).type.spec.tableRole === "table") {
      tableStart = selection.$anchorCell.before(d);
      break;
    }
  }

  if (tableStart === -1 || tableStart !== tablePos) return false;

  const map = TableMap.get(state.doc.nodeAt(tablePos)!);
  const anchorRect = map.findCell(selection.$anchorCell.pos - tableStart - 1);
  const headRect = map.findCell(selection.$headCell.pos - tableStart - 1);

  return (
    Math.min(anchorRect.top, headRect.top) <= rowIndex &&
    Math.max(anchorRect.bottom, headRect.bottom) >= rowIndex + 1 &&
    Math.min(anchorRect.left, headRect.left) === 0 &&
    Math.max(anchorRect.right, headRect.right) === map.width
  );
}

/**
 * Checks if the entire table is selected.
 */
export function isTableSelected(state: EditorState, tablePos: number): boolean {
  const { selection } = state;
  if (!(selection instanceof CellSelection)) return false;

  // Find the table node start
  let tableStart = -1;
  for (let d = selection.$anchorCell.depth; d > 0; d--) {
    if (selection.$anchorCell.node(d).type.spec.tableRole === "table") {
      tableStart = selection.$anchorCell.before(d);
      break;
    }
  }

  if (tableStart === -1 || tableStart !== tablePos) return false;

  const map = TableMap.get(state.doc.nodeAt(tablePos)!);
  const anchorRect = map.findCell(selection.$anchorCell.pos - tableStart - 1);
  const headRect = map.findCell(selection.$headCell.pos - tableStart - 1);

  return (
    anchorRect.left === 0 &&
    anchorRect.top === 0 &&
    headRect.right === map.width &&
    headRect.bottom === map.height
  );
}

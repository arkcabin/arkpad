import { type ResolvedPos, type Node } from "prosemirror-model";
import { type Schema } from "prosemirror-model";
import { TableMap } from "prosemirror-tables";

/**
 * Creates a table node grid.
 */
export function createTable(schema: Schema, rows: number, cols: number) {
  const cellType = schema.nodes.table_cell;
  const rowType = schema.nodes.table_row;
  const tableType = schema.nodes.table;

  if (!cellType || !rowType || !tableType) {
    throw new Error(
      "Table nodes not found in schema. Make sure the Table extension is registered."
    );
  }

  const rowNodes: Node[] = [];
  for (let i = 0; i < rows; i += 1) {
    const cells: Node[] = [];
    for (let j = 0; j < cols; j += 1) {
      // Start with null colwidth to allow the CSS width: 100% to distribute columns evenly
      // prosemirror-tables will update these to fixed pixels once the user resizes
      const cell = cellType.createAndFill({
        colwidth: null,
      });
      if (cell) cells.push(cell);
    }
    rowNodes.push(rowType.create(null, cells));
  }

  return tableType.create(null, rowNodes);
}

/**
 * Finds the table cell node at the current selection.
 */
export function findTableCell($pos: ResolvedPos) {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.type.spec.tableRole === "cell" || node.type.spec.tableRole === "header_cell") {
      return { node, pos: $pos.before(d), depth: d };
    }
  }
  return null;
}

/**
 * Gets the TableMap and starting position of the table containing the given position.
 */
export function getTableMapContext($pos: ResolvedPos) {
  for (let d = $pos.depth; d > 0; d--) {
    const node = $pos.node(d);
    if (node.type.spec.tableRole === "table") {
      return {
        map: TableMap.get(node),
        tablePos: $pos.before(d), // Outer position
        tableStart: $pos.start(d), // Content start (O-indexed for TableMap)
        tableNode: node,
      };
    }
  }
  return null;
}

/**
 * Gets the rectangle (row, col coordinates) for a cell at the given position.
 */
export function getCellRect($pos: ResolvedPos) {
  const context = getTableMapContext($pos);
  if (!context) return null;

  const cell = findTableCell($pos);
  if (!cell) return null;

  const relativePos = cell.pos - context.tableStart;
  return {
    ...context.map.findCell(relativePos),
    ...context,
  };
}

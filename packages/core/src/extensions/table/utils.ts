import { type ResolvedPos, type Node } from "prosemirror-model";
import { type Schema } from "prosemirror-model";

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
      const cell = cellType.createAndFill();
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

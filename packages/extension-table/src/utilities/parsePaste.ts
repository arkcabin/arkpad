import { Fragment, Schema, PMDOMParser } from "@arkpad/core";

/**
 * Parses an HTML table into a ProseMirror Fragment.
 */
export function parseHTMLTable(html: string, schema: Schema): Fragment | null {
  if (typeof window === "undefined") return null;

  const domParser = new window.DOMParser();
  const doc = domParser.parseFromString(html, "text/html");
  const table = doc.querySelector("table");

  if (!table) return null;

  const pmParser = PMDOMParser.fromSchema(schema);
  const slice = pmParser.parseSlice(table);

  return slice.content;
}

/**
 * Parses TSV/CSV data into a 2D array of strings.
 */
export function parseTableData(text: string): string[][] {
  const isTSV = text.includes("\t");
  const rows = text.split(/\r?\n/).filter((row) => row.trim().length > 0);

  return rows.map((row) => {
    if (isTSV) {
      return row.split("\t");
    }
    return row.split(",");
  });
}

/**
 * Creates a ProseMirror table node from a 2D data array.
 */
export function createTableFromData(schema: Schema, data: string[][]): any {
  const { table, table_row, table_cell, paragraph } = schema.nodes;

  if (!table || !table_row || !table_cell || !paragraph) {
    return null;
  }

  const rows = data.map((rowData) => {
    const cells = rowData.map((cellData) => {
      return table_cell.create(
        null,
        Fragment.from(paragraph.create(null, cellData ? schema.text(cellData) : []))
      );
    });
    return table_row.create(null, Fragment.from(cells));
  });

  return table.create(null, Fragment.from(rows));
}

import { getColStyleDeclaration } from "./colStyle";

export type ColGroup =
  | {
      colgroup: any;
      tableWidth: string;
      tableMinWidth: string;
    }
  | Record<string, never>;

export function createColGroup(node: any, cellMinWidth: number): ColGroup {
  let totalWidth = 0;
  let fixedWidth = true;
  const cols: any[] = [];
  const row = node.firstChild;

  if (!row) {
    return {};
  }

  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs;

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth = colwidth && (colwidth[j] as number | undefined);

      const width = hasWidth || Math.max(cellMinWidth, 100);
      totalWidth += width;

      if (!hasWidth) {
        fixedWidth = false;
      }

      const [property, value] = getColStyleDeclaration(cellMinWidth, width);

      cols.push(["col", { style: `${property}: ${value}` }]);
    }
  }

  const tableWidth = fixedWidth ? `${totalWidth}px` : "";
  const tableMinWidth = fixedWidth ? "" : `${totalWidth}px`;

  const colgroup = ["colgroup", {}, ...cols];

  return { colgroup, tableWidth, tableMinWidth };
}

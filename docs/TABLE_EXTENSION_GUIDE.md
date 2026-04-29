# 📑 Arkpad Table Extension Master Guide

This is the complete technical documentation for the Arkpad Table system.

## 1. Overview

Arkpad Tables are designed to be **modular**, **performant**, and **headless**. They are built using four main nodes: `Table`, `TableRow`, `TableHeader`, and `TableCell`.

## 2. Installation

The Table extension is a bundle that includes all necessary nodes (`table`, `table_row`, `table_header`, `table_cell`) and plugins (resizing, editing) automatically.

```typescript
import { Table } from "@arkpad/core";

const editor = new ArkpadEditor({
  extensions: [
    Table.configure({
      resizable: true, // Enables column resizing
    }),
  ],
});
```

## 3. Commands API

| Command                       | Usage                                               |
| :---------------------------- | :-------------------------------------------------- |
| `insertTable({ rows, cols })` | `editor.commands.insertTable({ rows: 3, cols: 3 })` |
| `addColumnBefore()`           | Inserts a column to the left.                       |
| `addColumnAfter()`            | Inserts a column to the right.                      |
| `deleteColumn()`              | Deletes the selected column.                        |
| `addRowBefore()`              | Inserts a row above.                                |
| `addRowAfter()`               | Inserts a row below.                                |
| `deleteRow()`                 | Deletes the selected row.                           |
| `mergeCells()`                | Merges selected cells.                              |
| `splitCell()`                 | Splits a merged cell.                               |
| `deleteTable()`               | Removes the entire table.                           |

## 4. Styling (CSS)

```css
.ark-editor table {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 1rem 0;
  border: 1px solid #ccc;
}

.ark-editor td,
.ark-editor th {
  min-width: 100px;
  border: 1px solid #ccc;
  padding: 8px;
  vertical-align: top;
}
```

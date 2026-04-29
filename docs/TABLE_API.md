# 📊 Arkpad Table API Reference

The Arkpad Table Extension is a high-performance, modular grid engine built on top of native ProseMirror transforms. It provides a "Pro-Data" experience with support for column resizing, cell merging, and markdown shortcuts.

## 🚀 Quick Start

### Installation
The Table extension is included in the `Essentials` bundle by default.
```typescript
import { Essentials } from "@arkpad/core";

const editor = useArkpadEditor({
  extensions: [
    ...Essentials,
  ],
});
```

### Markdown Shortcut
Type `|||` followed by a **Space** to instantly create a 3-column table.
- `||` + Space = 2 columns
- `||||` + Space = 4 columns

---

## 🛠 Commands

Access these via `editor.commands` or `editor.runCommand(name, args)`.

| Command | Arguments | Description |
| :--- | :--- | :--- |
| `insertTable` | `{ rows: 3, cols: 3 }` | Inserts a new table at the current selection. |
| `addColumnBefore` | - | Adds a column to the left of the current cell. |
| `addColumnAfter` | - | Adds a column to the right of the current cell. |
| `deleteColumn` | - | Deletes the current column. |
| `addRowBefore` | - | Adds a row above the current cell. |
| `addRowAfter` | - | Adds a row below the current cell. |
| `deleteRow` | - | Deletes the current row. |
| `mergeCells` | - | Merges selected cells into one. |
| `splitCell` | - | Splits a merged cell back into individual cells. |
| `toggleHeaderRow` | - | Toggles the current row between Header and Body type. |
| `toggleHeaderColumn`| - | Toggles the current column between Header and Body type. |
| `toggleHeaderCell` | - | Toggles the specific cell type. |
| `setCellAttribute` | `{ name, value }` | Sets an attribute for the selected cell(s). |
| `clearCellContents` | - | Wipes all content inside the selected cell(s). |
| `deleteTable` | - | Deletes the entire table. |
| `fixTables` | - | Emergency utility to fix corrupted table structures. |

### 🎯 Advanced Selection
These commands allow you to programmatically select parts of the table:
- `selectColumn(index)`: Selects the entire column at the given index.
- `selectRow(index)`: Selects the entire row at the given index.

---

## 🎨 Attributes & Styling

### Configuration Options
When configuring the extension manually:
```typescript
Table.configure({
  resizable: true,        // Enable/Disable column resizing
  handleWidth: 5,         // The hit-area for resizing (px)
  cellMinWidth: 25,       // Minimum width of a cell (px)
  lastColumnResizable: true,
})
```

### CSS Classes
Target these in your `styles.css` for custom themes:
- `.ProseMirror table`: The main table container.
- `.ProseMirror th`: Header cells.
- `.ProseMirror td`: Body cells.
- `.selectedCell`: Applied to cells during multi-selection.
- `.column-resize-handle`: The visual line shown during resizing.

---

## 🧠 Performance Architecture

The extension uses **`TableMap`** for O(1) grid calculations. This ensures that even with thousands of cells and complex merges, actions like "Add Row" remain instantaneous without blocking the UI thread.

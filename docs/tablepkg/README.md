# 📊 Table Extension Analysis & Roadmap

This document outlines the current state of the `@arkpad/extension-table` package and the planned improvements to bring it to feature parity with modern block-based editors.

## 🟢 Current Features (Implemented)
The extension currently wraps `prosemirror-tables` and provides the following:

### Core Nodes
- `table`: The main table container.
- `table_row`: Row container.
- `table_cell`: Standard data cell.
- `table_header`: Header cell (with `th` tag).

### Commands
- `insertTable({ rows, cols, withHeaderRow })`: Creates a new table structure.
- `addColumnBefore`, `addColumnAfter`, `deleteColumn`.
- `addRowBefore`, `addRowAfter`, `deleteRow`.
- `mergeCells`, `splitCell`.
- `toggleHeaderRow`, `toggleHeaderColumn`, `toggleHeaderCell`.
- `setCellAttr(name, value)`: Generic attribute setter.
- `fixTables`: Emergency utility to fix corrupted table structures.
- `goToNextCell(direction)`: Navigates between cells.
- `exitTable()`: Inserts a paragraph after the table and moves focus there.

### UX & Keyboard
- `Tab`: Move to next cell. If at the last cell, it automatically adds a new row and moves focus there.
- `Shift-Tab`: Move to previous cell.
- `Shift-Enter`: Exit table command.
- `Resizable`: Optional column resizing (toggleable in configuration).

---

## 🛠 Missing Features & Roadmap (To-Do)

### 1. Table Grips (Interaction UI)
The CSS in `packages/core/styles/table.css` already supports `.grip-column` and `.grip-row`, but the logic is missing in the extension.
- **Goal**: Implement a ProseMirror plugin to inject "grips" (handle bars) on the top and left of the table.
- **Benefit**: Allows users to select an entire row or column with one click, similar to Notion or Google Sheets.

### 2. Styling & Formatting Commands
While the schema supports attributes, high-level commands are missing:
- **`setCellBackground(color)`**: Dedicated command to set the background color of selected cells.
- **Alignment Commands**: Support for `horizontalAlign` (`left`, `center`, `right`) and `verticalAlign` (`top`, `middle`, `bottom`).

### 3. Contextual UI (React)
- **Floating Bubble Menu**: A dedicated menu that appears when the cursor is inside a table, offering quick access to row/column operations.
- **Grid Picker**: A visual 10x10 grid UI for the `insertTable` command.

### 4. Advanced Selection
- **`selectColumn(index)`** and **`selectRow(index)`**: Programmatic selection of entire sections. (Currently mentioned in some docs but not fully implemented in the extension logic).

### 5. Advanced Operations
- **Drag & Drop**: Reordering of rows/columns via the Grips.
- **Excel-Style Paste**: Improved handling of multi-cell data pasting.

---

## 📅 Implementation Priority
1. **Table Grips**: (High Priority) Provides the visual foundation for advanced selection.
2. **Styling Commands**: (Medium Priority) Essential for rich document creation.
3. **Floating Menu**: (Medium Priority) Improves discoverability of commands.

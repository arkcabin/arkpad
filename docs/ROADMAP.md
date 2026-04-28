# Arkpad Premium Roadmap

This document outlines the multi-phase plan to transform Arkpad into a world-class, professional writing environment.

---

## Phase 1: Dynamic Formatting & UI (Implemented ✅)

- **Minimalist Flat UI**: Clean, professional, shadow-less interface with a refined toolbar.
- **Modular Markdown System**:
  - **`parser`**: Robust Markdown-to-HTML engine for pasting and initialization.
  - **`serializer`**: Full document-to-Markdown conversion for data export.
- **Full Format Flexibility**: Support for JSON, HTML, and Markdown/MDX in `setContent` and data output.
- **Markdown Input Rules**: Instant "type-to-format" triggers:
  - `# `, `## `, etc. → Headings.
  - `> ` → Blockquote.
  - `- `, `* `, `1. ` → Lists.
  - `[ ] `, `[x] ` → Task Lists.
  - `---`, `***`, `___` → Horizontal Rules.
  - `**bold**`, `_italic_`, `~~strike~~`, `` `code` ``, `==highlight==`.

---

## Phase 2: Polish & Productivity (Planned)

- **Smart Typography**: Automatic conversion of standard character patterns:
  - `(c)` → `©`, `(tm)` → `™`.
  - `--` → `—` (em-dash).
  - `"quote"` → `“quote”` (smart curly quotes).
- **Enhanced Status Bar**: Real-time writing metrics in the footer:
  - Word Count.
  - Estimated Reading Time.
  - Auto-save status indicator.

---

## Phase 3: Advanced Structure (Planned)

- **Table Support**: Full table manipulation capabilities:
  - Insert Table (Grid-based selection).
  - Add/Remove Rows & Columns.
  - Header Row support.
  - Cell background colors.

---

## Phase 4: Block Mechanics (Planned)

- **Notion-style Drag Handles**: Visual handles on the left side of blocks for easy reordering.
- **Slash Command (/)**: A searchable menu to quickly insert blocks without using the toolbar.

# Future UI Components (Phase 4/5)

This document tracks the vision for pre-built, "ready-to-use" UI components for Arkpad. While the current focus is purely **headless**, we plan to provide these as an optional tier for rapid development.

## 🎨 Proposed Components

### 1. `ArkpadStandardToolbar`
A fully-featured horizontal toolbar with buttons for:
- Basic formatting (Bold, Italic, etc.)
- Headings & Paragraph styles
- List toggles
- History controls (Undo/Redo)

### 2. `ArkpadFloatingMenu`
A context-aware menu that appears next to empty lines to suggest blocks (images, headings, tables).

### 3. `ArkpadBubbleMenu`
A refined popup for text selection with quick formatting and link tools.

## 🛠️ Implementation Strategy

- **Tailwind-First**: All components will be styled with Tailwind CSS utility classes.
- **Shadcn Integration**: We will provide "Stencils" (copy-pasteable code) that use Shadcn UI primitives.
- **Opinionated Defaults**: While headless gives total control, these will provide a "Golden Path" for UI.

---
*Note: This is a placeholder for future implementation. Current development is focused on the Headless Core API.*

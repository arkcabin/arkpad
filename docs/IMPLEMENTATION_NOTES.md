# Implementation Notes & Bug Fixes

This document tracks specialized logic and architectural fixes implemented to maintain the "Premium & Ultra-Fast" experience of Arkpad. Refer to this if you need to modify core behavior or styling.

---

## 1. Tailwind v4 Monorepo Scanning
**Files:** `apps/arkpad/src/styles.css`, `packages/react/package.json`

### The Problem
Tailwind v4's `@source` directive can fail to scan workspace packages if their `src` folders are not explicitly exposed, leading to missing styles for React components (like the Checkbox).

### The Solution
**Final Choice: Relative Pathing**: Use direct relative paths in CSS to bypass Node resolution restrictions and ensure 100% reliable scanning in the dev environment:
```css
@source "../../../packages/react/src";
```
*(Note: We attempted to use @arkpad/react alias, but reverted to relative paths to ensure stability across server restarts).*

---

## 2. Dynamic Alignment Protection (Notion-style)
**File:** `packages/core/src/extensions/alignment.ts`

### The Problem
Applying `text-align: right` or `center` to a paragraph inside a list item causes the text to "disconnect" from its checkbox/bullet, breaking the UI.

### The Solution
Implemented a **Dynamic Ancestor Guard**. Before applying alignment, the engine resolves the document position and climbs the node tree. If it detects **any** ancestor node with "list" in its name, it suppresses the command.
*   **Why**: This mimics Notion's behavior where lists are strictly left-aligned for scannability.

---

## 3. Safe List-Type Switching
**File:** `packages/core/src/extensions/utils.ts`

### The Problem
Switching a list type (e.g., Task List → Bullet List) using `setNodeMarkup` on the wrapper only causes a `RangeError` because the children (e.g., `taskItem`) become invalid content for the new wrapper (e.g., `bulletList`).

### The Solution
Implemented **Full Node Reconstruction**. Instead of just changing the wrapper, the `toggleList` function now:
1.  Loops through all items in the existing list.
2.  Recreates them as the new target `itemType`.
3.  Replaces the entire range with a brand-new, schema-valid list node using `tr.replaceWith`.

---

## 4. Notion-style TaskView Centering
**File:** `packages/react/src/views/Task.tsx`, `apps/arkpad/src/styles.css`

### The Problem
Visual misalignment where the checkbox looks too high or the text looks "stuck to the bottom" due to browser font rendering differences.

### The Solution
1.  **Mathematical Centering**: Switched from `items-start` to `items-center` in flexbox to force the checkbox and text to share an exact center axis.
2.  **Margin Resets**: Applied `!m-0` and `!leading-snug` to paragraphs inside `.task-item` to remove default browser spacing that pushes the text down.
3.  **Compact Spacing**: Removed all padding (`py-0`) and margins (`mb-0`) to achieve the tight vertical stacking found in modern block editors.

---

## 5. Modular Markdown & MDX System
**Files:** `packages/core/src/extensions/markdown/*`, `packages/core/src/editor.ts`

### The Problem
Standard editors often treat Markdown only as an "input trigger" or a "paste hack," making it difficult to use the editor in a full MDX/Developer-centric workflow where data needs to be stored and fetched as clean Markdown.

### The Solution
Implemented a **Unified Markdown Module** consisting of a dedicated `parser` and `serializer`.
1.  **Semantic Parsing**: The `markdownToHtml` utility uses regex-based semantic mapping to ensure nested lists and complex marks are correctly resolved before hitting the ProseMirror DOM parser.
2.  **State-to-Text Serialization**: The `MarkdownSerializer` walks the ProseMirror node tree and reconstructs clean, standard Markdown. This allows the editor to offer a `getMarkdown()` method for blog-post ready exports.
3.  **Format-Aware initialization**: The `setContent` method now accepts a `format` parameter ('html' | 'markdown' | 'json'), allowing the editor to act as a "universal translator" for text data.

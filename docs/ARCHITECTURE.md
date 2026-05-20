# Arkpad Architecture: Unified Page Builder & Text Editor

## 1. Vision & Core Philosophy

Arkpad is a high-performance, lightweight platform designed to serve as both a **Rich Text Editor** and a **Visual Page Builder** using a single "Unified Core."

- **Unified Core:** A single engine (ProseMirror-based) that handles logic for both documents and pages.
- **Recursive Nesting:** A tree-based architecture where blocks (Sections, Columns) can contain other blocks or editors.
- **JSON-First:** Every action produces a clean, structured JSON tree for storage and rendering.

## 2. Technical Architecture (The 3-Layer System)

### Layer 0: The Unified Core (`@arkpad/core`)

The "Brain" of the system, completely headless and shared across all implementations.

- **Transaction Manager:** Handles Undo/Redo and history lifecycle.
- **Command Proxy:** Superior DX for calling commands (`editor.commands.*`).
- **Recursive Schema:** A dynamic schema builder that allows nodes to contain other nodes.
- **Menu Engine:** Logic to position floating/bubble menus relative to the selection.

### Layer 1: Modular Kits (`@arkpad/extensions`)

Functional building blocks that can be "Plug-and-Play."

- **Text Kit:** Standard rich-text features (Bold, Italic, Lists, Headings).
- **Layout Kit:** Structural nodes (Section, Columns, Grid).
- **Component Kit:** Specialized UI blocks (Button, Card, Hero, Image).

### Layer 2: Visual Integration (`@arkpad/react`)

The React layer that turns JSON into interactive UI using Shadcn/UI.

- **NodeViews:** Each block (Button, Section, etc.) is a real React component.
- **Tailwind Mapping:** Directly maps block attributes to Tailwind CSS classes.
- **Contextual UI:** Floating menus and property inspectors that adapt to the selected block.

## 3. Key Interaction Patterns

### "Dual-Mode" Editing

The editor intelligently switches behavior based on context:

1.  **Design Mode:** Triggered when selecting a `Section` or `Column`. Allows for reordering, adjusting layout, and changing background attributes.
2.  **Edit Mode:** Triggered when clicking inside a `Text` block. Activates the full rich-text engine (Bold, Italic, etc.).

### Command Access

- **Slash Commands (`/`):** Quick-access menu to insert any modular block.
- **Floating Toolbar:** Contextual actions that appear immediately above the active selection.

## 4. Implementation Roadmap

### Phase 1: Modular Refactor

- Refactor `@arkpad/core` to support recursive node nesting.
- Extract existing text extensions into a standalone `TextKit`.

### Phase 2: Layout Infrastructure

- Build the `Section`, `Columns`, and `Column` extensions.
- Implement the "Drag Handle" logic for reordering blocks.

### Phase 3: Component Block Development

- Build the **Button Block** (Core logic + Shadcn View).
- Build the **Card Block** with attribute mapping.

### Phase 4: UI/UX Layer

- Implement the **Slash Command Menu**.
- Create the **Floating Property Inspector** for real-time attribute editing.

## 5. Performance & Scalability

- **Lazy Loading:** Only load the React components for the blocks present on the page.
- **Fast-Path Indexing:** Pre-indexed hooks to avoid iterating all extensions on every keystroke.
- **Zero-Latency Updates:** Synchronous menu positioning for a premium feel.

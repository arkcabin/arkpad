# Arkpad Engine: Internal Logic & State Management

This document defines the "Brain" of the Arkpad Core. These rules ensure the engine is stable enough to support a professional Page Builder.

## 1. The Recursive Node Lifecycle

The engine must handle "Deep Trees" without performance lag.

- **Rules:** Every node has a `depth` and a `parentId`.
- **Constraint:** The root `doc` node must allow a `layout` attribute to define the "Editor Mode" (Canvas vs. Document).

## 2. Atomic Transaction Management

To ensure a perfect "Undo/Redo" experience for layout changes:

- **Grouping:** Commands that modify multiple nodes (like creating a 3-column grid) must be wrapped in a single transaction `step`.
- **Validation:** After every transaction, the engine runs a "Sanity Check" to ensure no Section is empty or orphaned.

## 3. Scoped Command Execution (The "Context" Filter)

The engine must "Know" where the user is to prevent illegal actions.

- **The Depth Filter:** If `selection.depth < 2`, the editor is in "Page Mode." Rich text commands (Bold, Italic) are blocked.
- **The Node Filter:** Commands are tagged with `type: "text"` or `type: "layout"`. The engine only executes the commands that match the current selection context.

## 4. Attribute Sanitization & Persistence

- **The "Tailwind Cleaner":** When a node is updated, the engine validates the `className` string. It prevents duplicate classes and removes "Dead" classes that no longer match the node's attributes.
- **Persistence:** Attributes are stored in the JSON but can also be "Mirrored" to the DOM for real-time CSS debugging.

## 5. Selection Boundaries (The "Anti-Ghost" Rule)

In a Page Builder, "Empty Space" between blocks is dangerous.

- **The Rule:** The selection must ALWAYS be inside a node. The engine will "Snap" the cursor to the nearest valid block if it detects it is in a "Ghost" area between Sections.

## 6. The "Node-View" Communication Protocol

- **Event Bus:** The Core provides an `emit()` system. When a node is clicked, the Core emits `node:selected` with the node's attributes.
- **Update Loop:** When the UI changes an attribute (e.g., color), it calls `editor.commands.updateAttributes()`, which triggers a fresh render loop.

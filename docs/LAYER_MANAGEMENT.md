# Arkpad Layer Management System

The Layer Management System is a specialized UI component for Arkpad that provides a visual hierarchy (Tree View) of the document structure. It is essential for complex page building, dashboards, and nested layouts.

## 1. Concept

While the main Canvas provides a "What You See Is What You Get" (WYSIWYG) experience, the Layer Panel provides a "What You See Is How It's Structured" experience. Every node in the Arkpad JSON is represented as a "Layer."

## 2. User Interactions

### A. Precise Drag & Drop

- **Reordering:** Users can drag layers vertically to change their order within the same parent.
- **Nesting/Un-nesting:** Users can drag a layer into a different container (e.g., moving a Button from a Card into a Section).
- **Target Indicators:** A visual highlight (blue line or ghost block) shows the drop destination before the action is completed.

### B. Selection & Navigation

- **Sync-selection:** Clicking a layer in the panel highlights the corresponding block in the editor (and vice versa).
- **Auto-scroll:** Selecting a layer automatically scrolls the main canvas to bring that element into view.

### C. Block Actions

- **Visibility Toggle:** An "Eye" icon to hide/show blocks (useful for designing complex overlapping sections).
- **Locking:** A "Lock" icon to prevent accidental movement or content edits on specific layers.
- **Renaming:** Users can double-click a layer name (e.g., "Section") to give it a custom name (e.g., "Hero Banner") for better organization.

## 3. Technical Implementation

### A. The "State-to-Tree" Hook

We will implement a custom React hook `useEditorLayers` that:

1.  Listens to `onTransaction` events in the Arkpad engine.
2.  Traverses the current `doc` JSON.
3.  Generates a flattened or nested data structure suitable for tree-rendering libraries (like `dnd-kit` or `react-arborist`).

### B. Tree-Canvas Synchronization

- **Metadata Mapping:** Each layer in the panel is linked to a unique `node-id` (using our `unique-id` extension).
- **Commands:** Drag actions in the panel trigger ProseMirror transactions (e.g., `tr.delete(from, to).insert(newPos, node)`).

## 4. UI Design (Shadcn/UI Based)

The sidebar will be built using:

- **`ScrollArea`**: For long pages with many layers.
- **`Accordion`**: To collapse/expand nested sections.
- **`ContextMenu`**: For quick actions like "Duplicate," "Delete," or "Wrap in Section."

## 5. JSON/Engine Integration Example

When a user drags a `Heading` layer into a `Column` layer:

1.  The Layer Panel identifies the source `pos` and the target `column-id`.
2.  The engine runs a command: `editor.commands.moveNode({ from: 12, to: 45 })`.
3.  The main editor updates instantly, and the JSON tree reflects the new hierarchy.

---

## 6. Benefits for the "Unified Core"

- **Developer Experience:** Makes it easy to debug complex nested schemas.
- **User Confidence:** Users can "see" how their page is built, reducing the fear of "breaking the layout."
- **Dashboard Support:** Essential for managing many small widgets in a complex grid.

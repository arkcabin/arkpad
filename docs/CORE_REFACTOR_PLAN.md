# Arkpad Core Refactor Plan

This document outlines the specific code changes required in `packages/core` to support the Unified Page Builder architecture.

## 1. Recursive Schema Updates (`schema-builder.ts`)

We must modify the `SchemaBuilder` to allow nodes to define their own "Content Hole."

- **Task:** Enable the `content` property in node extensions to support recursive definitions.
- **Goal:** `Section` -> `Columns` -> `Column` -> `Paragraph`.

## 2. Global Attribute Injector (`extensions/utils.ts`)

Instead of manual attributes for every block, we will implement a "Global Attribute Injector."

- **Task:** Create a function that automatically injects `id`, `className`, and `spacing` attributes into every node extension.
- **Goal:** Consistent styling API across all Shadcn blocks.

## 3. Contextual Command Manager (`CommandManager.ts`)

Update the command manager to handle "Scoped Execution."

- **Task:** Add a `can()` check that evaluates the current selection depth.
- **Goal:** Prevent "Text" commands from firing when a "Layout" node is selected.

## 4. Node-Selection Menu Engine (`MenuEngine.ts`)

The menu engine must be upgraded from "Cursor-Following" to "Boundary-Following."

- **Task:** Implement `getCoordsAtNode()` to calculate the bounding box of the active layout block.
- **Goal:** Menus should float above the selected Section or Card, not just the text cursor.

## 5. Unique ID Persistence (`extensions/unique-id.ts`)

Every block needs a persistent ID for the Layer Panel to work.

- **Task:** Ensure the `unique-id` extension is enabled by default for all "Block" type nodes.
- **Goal:** Stable IDs for Drag & Drop and Layer Management.

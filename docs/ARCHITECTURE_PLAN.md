# 🏗️ Arkpad Modular Architecture Plan

This document outlines the "Bold Breakup" strategy to transform Arkpad from a single-package library into a modular, multi-package ecosystem.

## 📁 Repository Structure (Workspaces)

We will follow a granular monorepo structure where each feature is its own package.

```bash
/packages
  ├── core/               # The "Brain" (Minimal, Infrastructure only)
  ├── extension-table/     # Table suite (Table, Row, Cell, Header)
  ├── extension-marks/     # Common marks (Bold, Italic, Strike)
  ├── extension-nodes/     # Common nodes (Heading, Blockquote, Image)
  ├── starter-kit/        # The "Easy Mode" bundle
  └── react/              # React components and hooks
/apps
  └── arkpad/             # Demo application
```

---

## 🧠 The Core (@arkpad/core)

The `core` package must remain "Feature-Blind." It handles the orchestration but does not define how text looks or behaves.

### ✅ What Core INCLUDES:
1.  **ArkpadEditor**: The main class for initialization and API access.
2.  **Extension Manager**: The engine that merges multiple extension schemas and plugins into a single ProseMirror instance.
3.  **Command Proxy**: The central registry for `editor.runCommand`.
4.  **Extension Base Classes**: Abstract classes for creating new Nodes, Marks, and Extensions.
5.  **Base Schema**: Only the absolute minimum required by ProseMirror (`doc`, `text`, `paragraph`).

### ⚙️ The 5 Engines of Core

The Core is composed of five internal "Engines" that provide the infrastructure for all extensions:

1. **Schema Resolver**: Merges the `NodeSpec` and `MarkSpec` from all active extensions into a single unified ProseMirror Schema. Handles node priorities and nesting rules.
2. **Command Orchestrator**: Provides the `editor.runCommand` and `editor.commands` proxy. It dynamically registers and routes commands from every extension.
3. **Keymap Manager**: Aggregates keyboard shortcuts from all extensions and resolves conflicts (e.g., ensuring multiple extensions don't fight over `Cmd+B`).
4. **InputRule Processor**: The engine for markdown shortcuts. It manages the real-time detection of patterns like `|||` (Tables) or `> ` (Blockquotes).
5. **State Bridge**: The reactive link between ProseMirror's internal state and the external world (React/Vue/etc.), handling transactions and selection updates.

### ❌ What Core EXCLUDES:
- No advanced nodes (Table, Image, CodeBlock).
- No marks (Bold, Italic, Link).
- No specialized CSS (except for base editor functional styles).
- No external dependencies like `prosemirror-tables` (these move to extensions).

---

## 🛡️ Deduplication & Overriding

To prevent issues when multiple packages (like a `starter-kit` and a standalone extension) are used together, the Core's **Schema Resolver** follows these rules:

1. **Unique Identity**: Every extension must have a unique `name` property.
2. **Auto-Deduplication**: If multiple extensions with the same name are provided, the Extension Manager will automatically filter out duplicates.
3. **The "Override" Pattern**: The resolver uses a "Last-One-Wins" strategy. Extensions placed later in the `extensions: [...]` array will override earlier ones. This allows users to easily swap out a standard StarterKit extension for a custom version.

---

## 🧩 Extension Strategy

Each extension package is responsible for its own:
- **Node/Mark Definitions**: Schema, `parseHTML`, and `renderHTML`.
- **Commands**: Specific actions (e.g., `addRow`).
- **Plugins**: Specific ProseMirror plugins (e.g., `tableEditing`).
- **Styles**: Scoped CSS for that specific feature.

---

## 📦 The Starter Kit (@arkpad/starter-kit)

To ensure the "Out of the Box" experience remains excellent, the `starter-kit` will act as a **Meta-Package**:
- It depends on `core` and all common extensions.
- It exports a single `Essentials` list that users can pass to their editor.

---

## ❓ FAQ: The Double-Installation Question

**Question**: *What happens if I install `@arkpad/starter-kit` AND `@arkpad/extension-bold` separately? Does it make my app twice as fat or cause crashes?*

**Answer**: No. There is a "Double Protection" system in place:

1. **At the Bundle Level (NPM)**: Modern package managers (npm/pnpm/yarn) are aware of the dependency tree. If two packages require the same version of an extension, the code is only included **once** in your final JavaScript bundle.
2. **At the Runtime Level (Arkpad Core)**: Even if you accidentally provide the same extension twice in your configuration:
   ```typescript
   extensions: [...StarterKit, Bold]
   ```
   The Arkpad `ExtensionManager` uses the unique `name` property to identify duplicates. It will automatically discard the earlier version and keep the latest one.

**Key Rule**: **Deduplication is automatic.** You can never "run two" of the same extension. This ensures the editor's memory usage and performance remain optimal regardless of the installation method.

---

## 🚀 Execution Roadmap

1. **Phase 1**: Move `Table` suite to `@arkpad/extension-table`.
2. **Phase 2**: Move `Bold`, `Italic`, etc. to `@arkpad/extension-marks`.
3. **Phase 3**: Strip `@arkpad/core` of all non-essential logic.
4. **Phase 4**: Create the `@arkpad/starter-kit` to link them all back together.

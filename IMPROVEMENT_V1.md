# Arkpad Improvement Roadmap (v1.0)

This document outlines the strategic roadmap to evolve **Arkpad** from a high-performance ProseMirror wrapper into a framework that surpasses Tiptap in flexibility, performance, and developer experience (DX).

---

## 1. Arkpad vs. Tiptap: The Competitive Edge

| Feature            | Tiptap              | Arkpad (Current)         | **Arkpad V1 Goal**                              |
| :----------------- | :------------------ | :----------------------- | :---------------------------------------------- |
| **Command System** | Chainable           | Chainable + Proxy Proxy  | **Telemetry-Aware Proxy** (Debuggable)          |
| **Extension API**  | Plugin-heavy        | Modular Collector        | **Plugin-less Events** (Native `onClick`, etc.) |
| **State Control**  | Standard History    | Basic JSON/HTML          | **Time-Travel snapshots** (Branching states)    |
| **Middleware**     | `appendTransaction` | First-class Interceptors | **Transaction Router** (Conditional routing)    |
| **Performance**    | O(N) Iteration      | Indexed Hooks            | **Virtualized & Batched Updates**               |

---

## 2. Core Pillars of Superiority

### A. Advanced State History (Time Travel)

Move beyond standard Undo/Redo.

- **Feature:** `editor.saveSnapshot(name)` and `editor.restoreSnapshot(name)`.
- **Value:** Allows developers to create "checkpoints" for AI workflows, A/B content testing, or complex multi-step forms without polluting the undo stack.

### B. The "Super-Interceptor" (Transaction Routing)

Evolution of the current Interceptor API.

- **Feature:** A routing system that can "capture" transactions based on metadata and redirect them to specialized handlers.
- **Value:** Handles AI-generated changes or collaborative sync conflicts in a isolated layer before they hit the document view.

### C. Declarative UI Bindings (Headless UI Engine)

Solve the "Menu Positioning" pain point.

- **Feature:** A core logic engine that calculates visibility and positioning (top, left, side) for Bubble/Floating menus and exposes it as a reactive state.
- **Value:** No more fighting `coordsAtPos`. Developers just consume `editor.ui.bubbleMenu.props`.

### D. Plugin-less Extensions

Simplifying the barrier to entry.

- **Feature:** Native event listeners (`onKeyDown`, `onClick`, `onPaste`) directly in the extension configuration.
- **Value:** Eliminates the need for developers to learn ProseMirror's `Plugin` system for basic interactions.

---

## 3. Enhancement Roadmap

### Phase 1: DX & Flexibility (The "Easy Wins")

1.  **Refactor `ArkpadExtension`:** Add native event hooks to bypass ProseMirror plugin boilerplate.
2.  **Snapshot API:** Implement memory-based state snapshotting.
3.  **Command Telemetry:** Add a logging system to track command execution and failure reasons.

### Phase 2: Performance & Scalability

1.  **Batching API:** Implement `editor.batch(() => { ... })` to group multiple operations into a single render cycle.
2.  **Virtualization Hooks:** Expose intersection and visibility data to the React layer for handling 10,000+ line documents.

### Phase 3: Intelligence & Future-Proofing

1.  **Ghost Text API:** Support for non-intrusive AI suggestions (decorations that don't shift document positions).
2.  **Multi-Editor Sync:** Built-in support for splitting one document across multiple editor instances with shared state logic.

---

**Next Step:** Discuss Phase 1 implementation details.

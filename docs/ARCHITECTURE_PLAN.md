# 🏗️ Arkpad: Modular Architecture & Evolution Plan

Arkpad is engineered as a **high-performance, agent-ready ecosystem**. This document outlines the strategic "Bold Breakup" required to transform Arkpad from a monolithic library into a premium, multi-package platform that empowers developers to build the next generation of intelligent editors.

---

## 🗺️ Architectural Overview

Arkpad follows a **decoupled, engine-first architecture**. The relationship between the core platform and the feature layer is designed for maximum scalability and "Super Ultra Fast" execution.

```mermaid
graph TD
    subgraph "@arkpad/core (The Brain)"
        A[ArkpadEditor Instance] --> B[Extension Manager]
        B --> C[Schema Builder]
        B --> D[Command Proxy]
        B --> E[Interceptor Layer]
        B --> F[Utility Belt]
    end

    subgraph "Feature Packages"
        G[@arkpad/extension-table] --> B
        H[@arkpad/extension-marks] --> B
        I[@arkpad/extension-nodes] --> B
        J[Custom User Extension] --> B
    end

    subgraph "Framework Layers"
        K[@arkpad/react] --> A
        L[Vanilla JS / Others] --> A
    end
```

---

## 📁 Repository Structure (Workspaces)

We follow a strict **Granular Monorepo** pattern. Every feature is a standalone package, ensuring users only bundle what they actually use.

```bash
/packages
  ├── core/               # Feature-blind infrastructure & extension factory
  ├── starter-kit/        # Meta-package bundling "The Essentials"
  ├── react/              # Premium React hooks & UI context
  ├── extension-table/     # Pro-data grid engine
  ├── extension-marks/     # Core typography (Bold, Italic, etc.)
  └── extension-nodes/     # Structural blocks (Headings, Lists, etc.)
/apps
  └── arkpad/             # High-fidelity showcase application
```

---

## 📦 The Solo Package Inventory

To ensure Arkpad is "Plug-and-Play," we break all features into standalone packages. This allows developers to add or remove features like Lego bricks.

| Package Category | Solo Package Name | Key Responsibilities |
| :--- | :--- | :--- |
| **Foundation** | `@arkpad/core` | Extension Factory, Command Proxy, Interceptor Layer, Schema Builder. |
| **Typography** | `@arkpad/extension-marks` | Bold, Italic, Underline, Strike, Code, Link, Highlight, Sub/Superscript. |
| **Layout** | `@arkpad/extension-nodes` | Paragraph, Heading (H1-H6), Blockquote, Horizontal Rule, Hard Break. |
| **Data** | `@arkpad/extension-table` | Table, TableRow, TableHeader, TableCell, Column Resizing, Cell Merging. |
| **Lists** | `@arkpad/extension-lists` | Bullet List, Ordered List, Task List (with checkboxes), Sink/Lift logic. |
| **Media** | `@arkpad/extension-image` | Image node, Upload handling, Resizing, Captioning. |
| **Intelligence** | `@arkpad/extension-ai` | Agentic Interceptor, Smart-Summarize, Tone-Switcher, AI-Prompt node. |
| **Experience** | `@arkpad/starter-kit` | The "Essentials" meta-package for 1-line installation. |

---

## 🧪 Anatomy of a "Solo" Extension Package

Every package follows this exact internal structure to ensure it is **100% self-contained** and "super easy to add and remove."

```bash
/packages/extension-[name]
  ├── src/
  │   ├── extension.ts      # The Class (Logic, Options, Storage)
  │   ├── commands.ts       # Solo file for editor.runCommand logic
  │   ├── plugins.ts        # Solo file for ProseMirror plugins/shortcuts
  │   ├── styles.css        # Scoped Tailwind/CSS for this feature
  │   └── index.ts          # Clean entry point
  ├── package.json          # Dependency list (e.g. depends on @arkpad/core)
  └── README.md             # Documentation & API Reference
```

---

## 🧠 The Arkpad Core Platform

The `@arkpad/core` package is the foundational platform. It provides the **"Developer Superpowers"** needed to build elite extensions without reading ProseMirror docs.

### ⚙️ The 5 Core Engines
1.  **Schema Resolver**: Runtime compilation of `prosemirror-schema`.
2.  **Command Orchestrator**: Proxy-based discovery of all extension actions.
3.  **Keymap & Shortcut Manager**: ecosystem-wide collision resolution.
4.  **Reactive Storage API**: Built-in data synchronization for extension state.
5.  **The Interceptor Layer**: Native transaction middleware for Agentic validation.

### 🛠️ Developer Superpowers (Internal APIs)
*   **The Utility Belt**: Built-in methods like `this.utils.isActive()` and `this.utils.toggleNode()` available inside every extension context.
*   **High-Fidelity Overrides**: Use `.extend()` to surgically modify a single command or shortcut of a built-in extension without replacing the whole package.
*   **UI Hook Factory**: Standardized methods for adding `BubbleMenu` or `FloatingMenu` directly from the extension class.

---

## 🧱 Building Custom Extensions

```typescript
import { Extension } from '@arkpad/core';

export const MyExtension = Extension.create({
  name: 'myExtension',

  addCommands() {
    return {
      // Using the Utility Belt for simple logic
      doSomething: () => ({ utils }) => {
        if (utils.isActive('bold')) {
          return utils.toggleNode('paragraph');
        }
        return true;
      },
    };
  },

  // Surgical override of a built-in behavior
  onUpdate() {
    console.log('Extension updated!');
  },
});
```

---

## 🚀 Evolution: Arkpad vs. Tiptap

| Feature | Tiptap v2 | **Arkpad** |
| :--- | :--- | :--- |
| **Philosophy** | Headless Library | **Agentic Platform** |
| **Middleware** | Plugin-based (Complex) | **Native Interceptor Layer** |
| **Developer DX** | External Utils | **Built-in Utility Belt** |
| **Modularity** | Mono-repo package | **Solo Package Architecture** |

---

## 🛣️ Implementation Roadmap

### Phase 1: Core Foundation & Superpowers
*   Refactor `@arkpad/core` to include the **Utility Belt** and **Interceptor Layer**.
*   Standardize the `Extension` base class with deep `.extend()` support.

### Phase 2: The "Solo" Migration
*   Split the current codebase into the **Solo Package Inventory** (Marks, Nodes, Table).
*   Create the `@arkpad/starter-kit` for instant onboarding.

### Phase 3: The Agentic Ecosystem
*   Release the reference `@arkpad/extension-ai`.
*   Provide the **Scaffold CLI** (`npx create-arkpad-extension`).

# Arkpad Extension Master Reference (V1)

This document is the definitive map of the Arkpad Core. Use this to understand what we have, where files are located, and how to build new features that align with the V1 Roadmap.

---

## 🗺️ Core File Map: "What is each file for?"

### 1. The Foundation (`/src`)
| File | What is it for? | When to use it? |
| :--- | :--- | :--- |
| `editor.ts` | The brain of Arkpad. | To change how the editor initializes or how React communicates with the engine. |
| `CommandManager.ts` | The command executor. | To add logging (Telemetry) or change how commands are intercepted. |
| `schema-builder.ts` | The compiler. | To change how nodes and marks are merged into the final document schema. |
| `types.ts` | The contract. | **Always start here** when defining new features or command arguments. |

### 2. The Logic Layer (`/src/commands`)
| File | Logic Type | Use case |
| :--- | :--- | :--- |
| `toggleBlock.ts` | Structural changes. | Converting a paragraph into a heading or blockquote. |
| `toggleMark.ts` | Inline styling. | Bold, Italic, Link, or any "text-wrapper" style. |
| `toggleList.ts` | List management. | Complex logic for nesting/un-nesting bullet and ordered lists. |
| `updateAttributes.ts` | Data updates. | Updating a node's metadata (e.g., changing an image URL or table width). |

### 3. The Feature Layer (`/src/extensions`)
| File | Feature | Use case |
| :--- | :--- | :--- |
| **`unique-id.ts`** | Block Tracking | **CRITICAL**: Use for snapshots, collaboration, and AI ghost-text. |
| **`base.ts`** | Core Defaults | Ensuring the document always has a paragraph at the end (`trailingNode`). |
| **`Extension.ts`** | The API | **V1 Goal**: Add lifecycle hooks like `onTransaction` or `onInterceptor`. |
| **`index.ts`** | The Bundle | Adding your new extension to the `Engine` so users get it by default. |

---

## 🛠️ Developer Guide: "How do I build a new extension?"

### Step 1: Choose your Type
*   **Node Extension**: For whole blocks (Tables, Images, AI Suggestion Boxes).
*   **Mark Extension**: For inline styles (Highlighter, Comment, Superscript).
*   **Functional Extension**: For logic that doesn't add a node (Character Count, Snapshot Manager, Telemetry).

### Step 2: The Extension Template
When creating a new file (e.g., `packages/core/src/extensions/snapshots.ts`), use this standard structure:

```typescript
import { Extension } from './Extension';

export const Snapshots = Extension.create({
  name: 'snapshots',

  addOptions() {
    return {
      maxSnapshots: 10,
    };
  },

  addStorage() {
    return {
      history: new Map(),
    };
  },

  addCommands() {
    return {
      saveSnapshot: (name: string) => ({ editor }) => {
        const json = editor.getJSON();
        this.storage.history.set(name, json);
        return true;
      },
    };
  },

  // NEW V1 HOOK: Use this instead of manual PM Plugins
  onTransaction({ transaction }) {
    if (transaction.docChanged) {
      // Logic to run on every change
    }
  },
});
```

---

## 🚀 V1 Competitive Edge Checklist
When you make a new extension, ask yourself:
1.  **Does it have Telemetry?** (Does it log why it failed?)
2.  **Does it use Unique IDs?** (Can we track these nodes across snapshots?)
3.  **Is it "Plugin-less"?** (Does it avoid raw ProseMirror boilerplate?)

---

## 📂 Summary of "What to use When"
*   **Need a new button?** → Add command in `/commands`, add button in `@arkpad/react`.
*   **Need a new shortcut?** → Add mapping in `extensions/keymap.ts`.
*   **Need a new block type?** → Create a new file in `extensions/` inheriting from `Node`.
*   **Need to intercept data?** → Add an interceptor in `ExtensionManager.ts`.

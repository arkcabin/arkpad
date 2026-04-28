# Arkpad (by AgentEdit)

**The High-Performance, Modular Foundation for Modern Rich Text Creation.**

Arkpad is an enterprise-grade rich text editor framework built on top of ProseMirror. It provides a sophisticated, developer-first API designed for building powerful, reliable, and highly customizable editing experiences.

---

## 🚀 Quick Start

### 1. Installation

```bash
npm install @arkpad/react @arkpad/core
```

### 2. Full React Implementation (with Toolbar)

Building a full UI is easy. Use the `ArkpadEditor` instance via the `useArkpadEditor` hook to check state and run commands.

```tsx
import { useArkpadEditor, ArkpadEditorContent } from "@arkpad/react";
import { Essentials } from "@arkpad/core";

function MyEditor() {
  const editor = useArkpadEditor({
    extensions: [Essentials],
    content: "<h1>Hello Arkpad</h1><p>Start building your custom UI.</p>",
  });

  if (!editor) return null;

  return (
    <div className="editor-container">
      {/* Toolbar */}
      <div className="toolbar">
        <button 
          onClick={() => editor.runCommand("toggleBold")}
          className={editor.isActive("strong") ? "is-active" : ""}
        >
          Bold
        </button>
        <button 
          onClick={() => editor.runCommand("toggleHeading", { level: 2 })}
          className={editor.isActive("heading", { level: 2 }) ? "is-active" : ""}
        >
          H2
        </button>
        <button onClick={() => editor.runCommand("undo")}>Undo</button>
      </div>

      {/* Editor Surface */}
      <ArkpadEditorContent editor={editor} />
    </div>
  );
}
```

---

## ✨ Features

- 🚀 **Extreme Performance** — Optimized for large documents.
- 🧩 **Purely Modular** — Only include what you use.
- 🛡️ **Type-Safe** — First-class TypeScript support.
- 🎨 **Headless** — You have 100% control over the CSS/UI.

---

## 📖 Learn More

*   **[Complete Developer Guide](./docs/COMPLETE_GUIDE.md)** — Deep dive into the API and advanced features.
*   **[Roadmap](./docs/ROADMAP.md)** — See where we are headed with Agentic AI.

---

Built with ❤️ by **ArkCabin**

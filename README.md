# Arkpad

**The High-Performance, Modular Foundation for Modern Rich Text Creation.**

Arkpad is an enterprise-grade rich text editor framework built on top of ProseMirror. It provides a sophisticated, developer-first API designed for building powerful, reliable, and highly customizable editing experiences without the overhead of traditional editors.

---

## ✨ Why Arkpad?

- 🚀 **Extreme Performance** — Optimized for large documents and complex state transitions.
- 🧩 **Purely Modular** — Zero-bloat architecture; only include the extensions you need.
- 🛡️ **Type-Safe by Design** — First-class TypeScript support for a robust developer experience.
- 🎨 **Headless & Unstyled** — Complete creative freedom over your UI and UX.
- 🌐 **Framework Ready** — Native React support with optimized hooks and components.

---

## 📦 Packages

Arkpad is distributed as a suite of specialized packages for maximum flexibility:

| Package                             | Purpose                                   | Version                                                                         |
| :---------------------------------- | :---------------------------------------- | :------------------------------------------------------------------------------ |
| [`@arkpad/core`](./packages/core)   | The core engine & ProseMirror abstraction | ![npm](https://img.shields.io/npm/v/@arkpad/core?color=blue&style=flat-square)  |
| [`@arkpad/react`](./packages/react) | Premium React components & hooks          | ![npm](https://img.shields.io/npm/v/@arkpad/react?color=blue&style=flat-square) |

---

## 🚀 Quick Start

### Installation

Get started in seconds by installing the core or React-specific package:

```bash
# For React applications
npm install @arkpad/react @arkpad/core

# For Vanilla JS or other frameworks
npm install @arkpad/core
```

### React Implementation

Arkpad provides a seamless React integration via the `useArkpadEditor` hook, ensuring perfect synchronization between editor state and your component tree.

```tsx
import { useArkpadEditor, ArkpadEditorContent } from "@arkpad/react";
import { Essentials } from "@arkpad/core";

function App() {
  const editor = useArkpadEditor({
    extensions: [Essentials],
    content: "<h1>Build something beautiful.</h1><p>Arkpad makes it easy.</p>",
    onUpdate: ({ editor }) => {
      console.log("Content changed:", editor.getHTML());
    },
  });

  return (
    <div className="editor-container">
      <ArkpadEditorContent editor={editor} />
    </div>
  );
}
```

### Vanilla JavaScript

```ts
import { ArkpadEditor, Essentials } from "@arkpad/core";

const editor = new ArkpadEditor({
  element: document.querySelector("#editor")!,
  extensions: [Essentials],
  content: "<p>The future of editing is here.</p>",
});
```

---

## 🛠️ Built for Customization

Arkpad isn't just an editor; it's a toolkit. Whether you're building a simple blog or a complex collaborative suite, Arkpad provides the primitives you need to succeed.

- [x] Custom Node & Mark Views
- [x] Powerful Command Pattern
- [x] Advanced Schema Definition
- [x] Real-time Collaboration Support (via Y.js)

---

## 📄 License

Arkpad is proudly open-source under the [MIT License](./LICENSE).

---

Built with ❤️ by **ArkCabin**

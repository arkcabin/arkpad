# Arkpad

**The Ultimate Modular Rich Text Framework.**

[**Live Demo**](https://arkcabin.github.io/arkpad/) | [**NPM Packages**](https://www.npmjs.com/org/arkpad)

Arkpad is an enterprise-grade rich text editor built on ProseMirror. It provides a sophisticated, developer-first API designed for building powerful, reliable, and highly customizable editing experiences.

![Arkpad Toolbar Preview](https://raw.githubusercontent.com/arkcabin/arkpad/main/assets/toolbar-preview.png)

## ✨ Features

- 🚀 **Extreme Performance** — Optimized for large, complex documents.
- 🎨 **Painting Tools** — Built-in Highlighter and Eraser "drawing" modes.
- 🧩 **100% Modular** — Tiny core, infinite extensions.
- 🛡️ **Type-Safe** — First-class TypeScript support.
- 🎨 **Headless** — Complete CSS/UI freedom.
- 🔍 **Native Search** — High-performance search and replace API.

## 📦 Packages

| Package | Version | Description |
| :--- | :--- | :--- |
| [`@arkpad/core`](./packages/core) | `1.6.4` | The core editor engine. |
| [`@arkpad/react`](./packages/react) | `1.6.4` | React hooks and components. |

## 🚀 Quick Start

```bash
npm install @arkpad/react @arkpad/core
```

```tsx
import { useArkpadEditor, ArkpadEditorContent } from '@arkpad/react';
import { Essentials } from '@arkpad/core';

export default function App() {
  const editor = useArkpadEditor({
    extensions: [Essentials],
    content: '<h1>The Ultimate Arkpad UI</h1>',
  });

  if (!editor) return null;

  return (
    <div className="ark-editor">
      <div className="toolbar">
        <button 
          onClick={() => editor.commands.toggleBold()}
          className={editor.isActive('strong') ? 'is-active' : ''}
        >
          Bold
        </button>
      </div>
      <ArkpadEditorContent editor={editor} />
    </div>
  );
}
```

## 📖 Documentation

- **[NPM Package Guide](./packages/core/README.md)** — Core API and Configuration.
- **[React Implementation](./packages/react/README.md)** — Hooks and UI components.
- **[Full Command Reference](./docs/COMMAND_REFERENCE.md)** — List of all 30+ available commands.

## 🛠 Features in Core

The following features are available in the `@arkpad/core` Essentials bundle:

- **Typography**: Bold, Italic, Underline, Strike, Code, Sub/Superscript.
- **Structure**: Headings 1-4, Blockquotes, Dividers, Images.
- **Lists**: Bullet, Ordered, and Task lists.
- **Tools**: Highlighter, Eraser, Search/Replace, Undo/Redo.
- **Alignment**: Left, Center, Right, Justify.

---

Built with ❤️ by **ArkCabin**

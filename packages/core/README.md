# @arkpad/core

**The High-Performance Engine for Arkpad Editor.**

`@arkpad/core` is the heart of the Arkpad ecosystem. It provides a sophisticated, headless abstraction over ProseMirror, allowing you to build powerful rich-text editing experiences with a clean, command-based API.

---

## ✨ Features

- 🚀 **Engineered for Speed** — Minimal overhead and optimized state management.
- 🧩 **Extension-First** — Purely modular architecture for custom nodes, marks, and plugins.
- 📝 **Markdown Native** — Built-in support for robust Markdown parsing and serialization.
- 🛡️ **Strictly Typed** — Written entirely in TypeScript for a reliable developer experience.

---

## 📦 Installation

```bash
npm install @arkpad/core
```

---

## 🚀 Quick Start

Initialize the editor core in any JavaScript environment:

```typescript
import { ArkpadEditor, StarterKit } from '@arkpad/core';

const editor = new ArkpadEditor({
  element: document.querySelector('#editor')!,
  extensions: [StarterKit],
  content: '<h2>Engineered for Excellence.</h2><p>Start building with Arkpad core.</p>',
  onUpdate({ editor }) {
    const html = editor.getHTML();
    // Handle content updates
  }
});
```

---

## 📄 License

MIT © [ArkCabin](https://github.com/arkcabin)

# @arkpad/react

**Premium React Components & Hooks for Arkpad.**

`@arkpad/react` provides the official React integration for the Arkpad ecosystem. It features optimized hooks and components designed to bring the power of ProseMirror into your React application with zero friction.

---

## ✨ Features

- 🪝 **`useArkpadEditor`** — A powerful hook that manages the editor lifecycle and reactive state.
- 🖼️ **`ArkpadEditorContent`** — A high-performance component for rendering your editor instance.
- 🫧 **Contextual Menus** — Built-in support for Bubble and Floating menus out of the box.
- ⚡ **Optimized Rendering** — Minimizes re-renders for a silky-smooth editing experience.

---

## 📦 Installation

```bash
npm install @arkpad/react @arkpad/core
```

---

## 🚀 Quick Start

Build a professional editor in just a few lines of code:

```tsx
import { useArkpadEditor, ArkpadEditorContent } from '@arkpad/react';
import { StarterKit } from '@arkpad/core';

function App() {
  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: '<h1>Build with Arkpad + React</h1><p>Start your journey here.</p>',
  });

  return (
    <div className="editor-shell">
      <ArkpadEditorContent editor={editor} />
    </div>
  );
}
```

---

## 📄 License

MIT © [ArkCabin](https://github.com/arkcabin)

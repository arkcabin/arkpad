# @arkpad/react

React components and hooks for the Arkpad rich text editor.

## 📦 Installation

```bash
npm install @arkpad/react @arkpad/core
```

## 🚀 Quick Start

```tsx
import { useArkpadEditor, ArkpadEditorContent } from '@arkpad/react';
import { Essentials } from '@arkpad/core';

const MyEditor = () => {
  const editor = useArkpadEditor({
    extensions: [Essentials],
    content: '<p>Built with Arkpad React</p>',
  });

  return <ArkpadEditorContent editor={editor} />;
};
```

## 🛠 Hooks & Components

### `useArkpadEditor(options)`
A hook that creates and manages an `ArkpadEditor` instance. It automatically handles cleanup on unmount.

### `ArkpadEditorContent`
The component that renders the editor surface.
- `editor`: The editor instance from `useArkpadEditor`.
- `className`: Optional CSS class for the container.

## 🎨 Building a Toolbar

Arkpad is headless, meaning you provide the UI. Here is how to build a toolbar matching the **Ultimate Arkpad UI**:

```tsx
import { useArkpadEditor } from '@arkpad/react';

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  const Button = ({ command, icon, activeName, activeAttrs }) => (
    <button
      onClick={() => editor.commands[command]()}
      className={editor.isActive(activeName || command, activeAttrs) ? 'is-active' : ''}
    >
      {icon}
    </button>
  );

  return (
    <div className="toolbar">
      <Button command="toggleBold" activeName="strong" icon="B" />
      <Button command="toggleItalic" activeName="em" icon="I" />
      <Button command="toggleUnderline" activeName="underline" icon="U" />
      
      <div className="divider" />
      
      <Button 
        command="toggleHeading" 
        activeAttrs={{ level: 1 }} 
        icon="H1" 
      />
      
      <Button 
        command="toggleHighlighter" 
        activeName="highlighter" 
        icon="🖍" 
      />
      
      <button onClick={() => editor.commands.undo()}>Undo</button>
      <button onClick={() => editor.commands.redo()}>Redo</button>
    </div>
  );
};
```

## 💡 Pro Tip: Reactive State
`useArkpadEditor` returns a reactive editor instance. Your UI will automatically re-render whenever the selection or content changes, making it trivial to keep toolbar states in sync.

---

Built by **ArkCabin**

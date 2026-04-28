# @arkpad/react

React components and hooks for the Arkpad rich text editor.

## Features

- **useArkpadEditor**: Easy-to-use hook for managing editor state.
- **ArkpadEditorContent**: Component to render the editor.
- **BubbleMenu & FloatingMenu**: Built-in components for contextual menus.

## Installation

```bash
npm install @arkpad/react @arkpad/core
```

## Usage

```tsx
import { useArkpadEditor, ArkpadEditorContent } from '@arkpad/react';

function App() {
  const editor = useArkpadEditor({
    content: '<p>Hello React!</p>',
  });

  return <ArkpadEditorContent editor={editor} />;
}
```

## License

MIT

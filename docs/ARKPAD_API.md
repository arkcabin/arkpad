# Arkpad API

Arkpad is a ProseMirror-based rich text editor framework. It provides a small, stable API that you can extend with your own extensions.

## Quick Start

### Core

```ts
import { ArkpadEditor } from '@arkpad/core'

const editor = new ArkpadEditor({
  element: document.querySelector('#editor')!,
  content: '<p>Hello World</p>',
  autofocus: true,
})
```

### React

```tsx
import { ArkpadEditorComponent } from '@arkpad/react'

function App() {
  return (
    <ArkpadEditorComponent
      content="<p>Write here</p>"
      onChange={({ html, json }) => console.log(html)}
      onReady={(editor) => console.log('Ready!')}
    />
  )
}
```

---

## Editor Methods

| Method | Description |
|--------|------------|
| `getState()` | Get current ProseMirror state |
| `getHTML()` | Serialize document to HTML |
| `getJSON()` | Serialize document to JSON |
| `getText()` | Extract plain text |
| `runCommand(name)` | Run a command by name |
| `canRunCommand(name)` | Check if command can run |
| `setContent(content)` | Replace document content |
| `clearContent()` | Reset to empty paragraph |
| `focus()` / `blur()` | Control focus |
| `setEditable(boolean)` | Toggle editability |
| `registerExtension(ext)` | Add runtime extension |
| `registerExtensions(exts)` | Add multiple extensions |
| `destroy()` | Cleanup editor |

---

## Configuration Options

```ts
interface ArkpadEditorOptions {
  element: HTMLElement          // Required: DOM element to mount
  content?: string | object    // Initial content (HTML or JSON)
  editable?: boolean          // Default: true
  extensions?: Extension[]   // Custom extensions
  autofocus?: boolean         // Focus on mount
  onCreate?: (editor) => void
  onUpdate?: (payload) => void
  onDestroy?: (editor) => void
}
```

---

## Built-In Commands

### Text Formatting

| Command | Shortcut | Description |
|---------|----------|-------------|
| `toggleBold` | Mod+B | Toggle bold |
| `toggleItalic` | Mod+I | Toggle italic |
| `toggleStrike` | Mod+Shift+S | Toggle strikethrough |
| `toggleCode` | Mod+E | Toggle inline code |

### Block formatting

| Command | Shortcut | Description |
|---------|----------|-------------|
| `setParagraph` | - | Set paragraph block |
| `toggleHeading` | Mod+Alt+1/2/3 | Set heading (1-3) |
| `toggleBlockquote` | Mod+Shift+B | Toggle blockquote |
| `toggleCodeBlock` | Mod+Alt+C | Toggle code block |

### History

| Command | Shortcut |
|---------|----------|
| `undo` | Mod+Z |
| `redo` | Mod+Y |

---

## Extension System

### Creating Custom Extensions

```ts
interface Extension {
  name: string
  addCommands?: () => Record<string, Command>
  addKeyboardShortcuts?: () => Record<string, Command>
  addInputRules?: () => Plugin[]
  addPasteRules?: () => Plugin[]
  addProseMirrorPlugins?: () => Plugin[]
}
```

### Example: Custom Extension

```ts
function createHighlight() {
  return {
    name: 'highlight',
    addCommands: () => ({
      toggleHighlight: (state, dispatch) => {
        // Custom toggle logic
        return true
      },
    }),
    addKeyboardShortcuts: () => ({
      'Mod-Shift-h': () => ({ state, dispatch }) => {
        // Toggle highlight
        return true
      },
    }),
  }
}

// Register it
editor.registerExtension(createHighlight())

// Run it
editor.runCommand('toggleHighlight')
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---------|--------|
| Mod+B | Bold |
| Mod+I | Italic |
| Mod+U | Underline |
| Mod+E | Code |
| Mod+Z | Undo |
| Mod+Y | Redo |
| Mod+Alt+1 | Heading 1 |
| Mod+Alt+2 | Heading 2 |
| Mod+Alt+3 | Heading 3 |

---

## Project Organization

```
@arkpad/core       # Core editor (vanilla JS)
@arkpad/react     # React component wrapper
@arkpad/app       # Demo application
```

### Core Package

The core package contains:

- `ArkpadEditor` - Main editor class
- `arkpadSchema` - ProseMirror schema
- `ExtensionManager` - Manages extensions
- `createDefaultExtensions()` - Built-in extensions
- Type definitions

---

## Upcoming Features

Arkpad is designed to grow into a full editor platform:

- **Link** - Add/edit hyperlinks
- **Image** - Add images with resizing
- **Placeholder** - Empty state placeholder
- **CharacterCount** - Word/character count
- **Table** - Table support
- **TaskList** - Todo/checklist items
- **Collaboration** - Real-time editing (Y.js)
- **Slash Commands** - Command menu

---

## Migration from Old API

If upgrading from an older version:

```diff
- import { createArkpadEditor } from '@arkpad/core'
+ import { ArkpadEditor } from '@arkpad/core'

- const editor = createArkpadEditor({ ... })
+ const editor = new ArkpadEditor({ ... })
```
# @arkpad/core

The high-performance, modular engine for the Arkpad rich text editor. Built on ProseMirror, designed for developers who need absolute control.

## 📦 Installation

```bash
npm install @arkpad/core
```

## 🚀 Usage

```typescript
import { ArkpadEditor, Essentials } from '@arkpad/core';

const element = document.querySelector('#editor');

if (element) {
  const editor = new ArkpadEditor({
    element,
    extensions: [Essentials],
    content: '<p>Hello World</p>',
    onUpdate: ({ editor }) => {
      console.log(editor.getHTML());
    },
  });
}
```

## 🛠 API Reference

### Configuration Options

| Option | Type | Description |
| :--- | :--- | :--- |
| `element` | `HTMLElement` | The DOM element to attach the editor to. |
| `extensions` | `Extension[]` | Array of Arkpad extensions. |
| `content` | `string \| JSON` | Initial content (HTML or JSON). |
| `editable` | `boolean` | Whether the editor is editable. Defaults to `true`. |
| `autofocus` | `boolean` | Focus the editor on creation. |

### Instance Methods

#### Content
- `getHTML(): string` - Returns document as HTML.
- `getJSON(): object` - Returns document as ProseMirror JSON.
- `getText(): string` - Returns document as plain text.
- `getMarkdown(): string` - Returns document as Markdown. (Requires markdown-compatible extensions).
- `setContent(content: string | JSON)` - Replaces editor content.
- `clearContent()` - Wipes the document.

#### State & Commands
- `commands` - Proxy object to run commands: `editor.commands.toggleBold()`.
- `chain()` - Start a command chain.
- `isActive(name: string, attrs?: object): boolean` - Check if a mark/node is active.
- `getAttributes(name: string): object` - Get attributes of the active mark/node.

#### Interaction
- `focus(pos?: 'start' | 'end' | number)` - Focus the editor.
- `blur()` - Remove focus.
- `setEditable(editable: boolean)` - Toggle read-only mode.
- `destroy()` - Cleanup the editor instance.

## 🧩 Extensions

Arkpad is entirely modular. You can use the `Essentials` bundle or pick individual extensions.

```typescript
import { 
  Bold, 
  Italic, 
  Heading, 
  BulletList,
  Highlighter 
} from '@arkpad/core/extensions';

const editor = new ArkpadEditor({
  extensions: [Bold, Italic, Heading.configure({ levels: [1, 2] })]
});
```

## 🎨 Custom Extensions

Creating extensions is straightforward:

```typescript
import { Extension } from '@arkpad/core';

const MyExtension = new Extension({
  name: 'myExtension',
  addCommands() {
    return {
      insertCustom: () => ({ tr, dispatch }) => {
        if (dispatch) tr.insertText('Custom Text');
        return true;
      }
    }
  }
});
```

---

Built by **ArkCabin**

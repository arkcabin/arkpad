# Arkpad Command Reference

This guide provides a comprehensive list of all commands available in the Arkpad core engine. You can execute these commands using `editor.runCommand(name, args)` or via the `editor.commands` proxy.

## 🛠 Toolbar Toolbox

Based on the standard Arkpad UI, here are the commands mapped to their functions:

| Icon | Name | Command | Arguments |
| :--- | :--- | :--- | :--- |
| **B** | Bold | `toggleBold` | - |
| *I* | Italic | `toggleItalic` | - |
| <u>U</u> | Underline | `toggleUnderline` | - |
| ~~S~~ | Strike | `toggleStrike` | - |
| 🖍 | Highlighter | `toggleHighlighter` | - |
| `<>` | Code | `toggleCode` | - |
| 🔗 | Link | `toggleLink` | `{ href: string }` |
| x² | Superscript | `toggleSuperscript` | - |
| x₂ | Subscript | `toggleSubscript` | - |
| ⌫ | Eraser | `toggleEraser` | - |
| **H1** | Heading 1 | `toggleHeading` | `{ level: 1 }` |
| **H2** | Heading 2 | `toggleHeading` | `{ level: 2 }` |
| **H3** | Heading 3 | `toggleHeading` | `{ level: 3 }` |
| **H4** | Heading 4 | `toggleHeading` | `{ level: 4 }` |
| 🖋 | Pen | `togglePen` | - |
| `>_` | Code Block | `toggleCodeBlock` | - |
| — | Divider | `insertHorizontalRule` | - |
| • | Bullet List | `toggleBulletList` | - |
| 1. | Ordered List | `toggleOrderedList` | - |
| ☑ | Task List | `toggleTaskList` | - |
| ≡ | Align Left | `setTextAlign` | `{ align: 'left' }` |
| ≡ | Align Center | `setTextAlign` | `{ align: 'center' }` |
| ≡ | Align Right | `setTextAlign` | `{ align: 'right' }` |
| ≡ | Justify | `setTextAlign` | `{ align: 'justify' }` |
| 🔍 | Search | `search` | `query: string \| RegExp` |
| 🖼 | Image | `setImage` | `{ src: string, alt?: string }` |
| ↩ | Undo | `undo` | - |
| ↪ | Redo | `redo` | - |

---

## 💻 API Examples

### Basic Command Execution
```typescript
// Using runCommand
editor.runCommand('toggleBold');

// Using the Command Proxy (Recommended)
editor.commands.toggleBold();
editor.commands.toggleHeading({ level: 2 });
```

### Checking Active State
Use `isActive` to highlight buttons in your UI. Note that the first argument is the **node or mark name** (e.g., 'strong' for bold).
```typescript
const isBold = editor.isActive('strong');
const isH2 = editor.isActive('heading', { level: 2 });
const isCentered = editor.isActive('textAlign', { align: 'center' });
```

### Chaining Commands
Perform multiple actions in a single transaction.
```typescript
editor.chain()
  .focus()
  .toggleBold()
  .insertContent('Hello World')
  .run();
```

### Search and Replace
```typescript
const results = editor.search('Arkpad');
console.log(`Found ${results.length} matches`);

editor.replace('old text', 'new text');
```

---

## 🎨 Painting Tools (Highlighter & Eraser)

Arkpad includes unique "painting" tools that allow users to apply or remove marks by "drawing" over text.

- **Highlighter**: When active, clicking and dragging over text applies the highlighter mark.
- **Eraser**: When active, clicking and dragging over text removes all marks (bold, italic, highlighter, etc.).

```typescript
// Toggle the painting mode
editor.commands.toggleHighlighter();
editor.commands.toggleEraser();
```

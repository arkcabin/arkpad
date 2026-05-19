# Core Extensions

This document provides a detailed reference for the core functional extensions included in the Arkpad engine and StarterKit. These extensions provide the baseline functionality required for a high-quality rich-text editing experience, mirroring the features found in Tiptap core.

## Extensions Overview

| Extension                                           | Purpose                        | Included In                        |
| --------------------------------------------------- | ------------------------------ | ---------------------------------- |
| [FocusEvents](#focusevents)                         | Focus and blur lifecycle hooks | Engine, CoreEssentials, StarterKit |
| [ClipboardTextSerializer](#clipboardtextserializer) | Plain-text clipboard handling  | Engine, CoreEssentials, StarterKit |
| [Keymap](#keymap)                                   | Enhanced keyboard shortcuts    | Engine, CoreEssentials, StarterKit |
| [ListKeymap](#listkeymap)                           | Smart list keyboard navigation | Engine, CoreEssentials, StarterKit |
| [TextDirection](#textdirection)                     | RTL/LTR text direction support | StarterKit                         |
| [Dropcursor](#dropcursor)                           | Visual drag-and-drop indicator | CoreEssentials, StarterKit         |
| [Gapcursor](#gapcursor)                             | Cursor in "impossible" spots   | CoreEssentials, StarterKit         |

---

## FocusEvents

The `FocusEvents` extension dispatches `onFocus` and `onBlur` lifecycle hooks to all registered extensions. This allows extensions to react when the editor gains or loses focus.

### Hooks

```typescript
onFocus?: (this: ExtensionContext) => boolean | void;
onBlur?: (this: ExtensionContext) => boolean | void;
```

---

## ClipboardTextSerializer

This extension provides consistent plain-text copying behavior across different block types. It ensures that when a user copies text, the plain-text representation is clean and follows the editor's structure.

### Configuration Options

```typescript
{
  blockSeparator?: string; // Default: "\n\n"
}
```

---

## Keymap

The `Keymap` extension provides enhanced keyboard shortcut handling for common operations. It uses a "smart" approach to handle scenarios like deleting empty blocks or selecting the entire document.

### Shortcuts Reference

| Key         | Command           | Description                                            |
| ----------- | ----------------- | ------------------------------------------------------ |
| `Enter`     | `splitBlock`      | Intelligently splits the current block or code block.  |
| `Mod-Enter` | `exitCode`        | Exits a code block and moves the cursor below it.      |
| `Backspace` | `undoInputRule`   | Reverts the last auto-conversion or deletes selection. |
| `Mod-a`     | `selectAll`       | Selects all content in the editor.                     |
| `Delete`    | `deleteSelection` | Deletes the current selection or joins forward.        |

---

## ListKeymap

Provides specialized keyboard shortcuts for managing lists.

### Shortcuts Reference

| Key         | Command        | Description                                                   |
| ----------- | -------------- | ------------------------------------------------------------- |
| `Tab`       | `sinkListItem` | Indents the current list item (converts to sub-list).         |
| `Shift-Tab` | `liftListItem` | Outdents the current list item.                               |
| `Backspace` | `liftListItem` | If at the start of a list item, outdents it into a paragraph. |

---

## TextDirection

Provides commands and global attributes for handling Right-to-Left (RTL) and Left-to-Right (LTR) text.

### Commands

```typescript
editor.runCommand("setTextDirection", "rtl"); // Set RTL direction
editor.runCommand("setTextDirection", "ltr"); // Set LTR direction
editor.runCommand("unsetTextDirection"); // Revert to default (LTR)
```

### Supported Nodes

- `paragraph`
- `heading`
- `blockquote`
- `listItem`
- `table_cell`
- `table_header`

---

## Dropcursor

Renders a visual indicator at the position where dragged content will be dropped.

### Configuration Options

```typescript
{
  width?: number; // Width of the indicator in pixels (Default: 1)
  color?: string; // Color of the indicator (Default: "currentColor")
  class?: string; // Custom CSS class for the indicator
}
```

---

## Gapcursor

Enables a special "gap" cursor that can be placed between block nodes that otherwise wouldn't allow a cursor (e.g., between two tables, or between a code block and a table). This ensures users can always insert new content between blocks.

---

## The `first` Utility Command

A powerful command utility that takes an array of commands and executes the first one that returns `true`. This is the standard pattern for implementing keyboard shortcuts with multiple fallbacks.

### Usage

```typescript
editor.runCommand("first", [
  ({ editor }) => editor.commands.toggleBold(),
  ({ editor }) => editor.commands.toggleItalic(),
  // ...
]);
```

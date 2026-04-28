# AgentEdit: The Complete Developer Guide

Welcome to the official documentation for **AgentEdit**, a high-performance, modular, and agent-ready rich text editor framework built on ProseMirror.

---

## 🚀 Quick Start

### 1. Installation

```bash
# For React applications (Recommended)
npm install @arkpad/react @arkpad/core

# For Vanilla JS or other frameworks
npm install @arkpad/core
```

---

## 🪝 The React Experience (`@arkpad/react`)

The React package is designed to be declarative and reactive. It handles the heavy lifting of synchronization between the editor state and the React render cycle.

### Example 1: Basic Implementation
This is the simplest way to get a professional editor running with the `Essentials` kit.

```tsx
import { useAgentEditor, AgentEditorContent } from "@arkpad/react";
import { Essentials } from "@arkpad/core";

export function SimpleEditor() {
  const editor = useAgentEditor({
    extensions: [Essentials],
    content: "<p>Start your journey with AgentEdit.</p>",
  });

  return (
    <div className="editor-shell">
      <AgentEditorContent editor={editor} />
    </div>
  );
}
```

### Example 2: Advanced Usage with Callbacks
Monitor updates and interact with the editor instance directly.

```tsx
const editor = useAgentEditor({
  extensions: [Essentials],
  autofocus: true,
  onCreate: (editor) => {
    console.log("Editor is ready!");
  },
  onUpdate: ({ html, json, text }) => {
    // Reactive updates
    console.log("Characters:", text.length);
  },
});

// Triggering commands from your own UI
const toggleBold = () => editor?.runCommand("toggleBold");
```

---

## 🍦 The Vanilla Experience (`@arkpad/core`)

For those not using React, the core library provides a powerful class-based API.

```ts
import { AgentEditor, Essentials } from "@arkpad/core";

const editor = new AgentEditor({
  element: document.querySelector("#editor")!,
  extensions: [Essentials],
  content: "<h1>Pure Performance</h1>",
});

// Programmatic control
editor.focus();
editor.runCommand("toggleItalic");
console.log(editor.getHTML());
```

---

## 📖 Full API Reference

| Method | Returns | Description |
| :--- | :--- | :--- |
| `getHTML()` | `string` | Returns the current document as an HTML string. |
| `getJSON()` | `object` | Returns the document as a clean JSON object (ProseMirror schema). |
| `getText()` | `string` | Extracts all plain text from the editor. |
| `getMarkdown()` | `string` | Returns a serialized Markdown version of the document. |
| `runCommand(name, ...args)` | `boolean` | Executes a command (e.g., `toggleBold`, `setHeading`). Returns success. |
| `canRunCommand(name)` | `boolean` | Checks if a command can currently be executed at the selection. |
| `isActive(name, attrs?)` | `boolean` | Checks if a mark (e.g., `bold`) or node (e.g., `heading`) is active. |
| `getAttributes(name)` | `object` | Returns the attributes of the active mark/node (e.g., heading level). |
| `setContent(data, format?)` | `void` | Replaces the entire document. Format can be `html`, `json`, or `markdown`. |
| `clearContent()` | `void` | Resets the editor to a single empty paragraph. |
| `setEditable(boolean)` | `void` | Toggles whether the editor is read-only. |
| `focus()` / `blur()` | `void` | Programmatically manages focus. |
| `destroy()` | `void` | Cleans up the instance and removes event listeners. |

---

## 🧩 The Essentials Kit

The `Essentials` kit bundles the following features by default:

*   **Structure**: Paragraphs, Headings (H1-H6), Horizontal Rules.
*   **Formatting**: Bold, Italic, Underline, Strike, Code, Highlight, Sub/Superscript.
*   **Lists**: Bulleted, Ordered, and Task Lists (with checkboxes).
*   **Media**: Images and Hyperlinks.
*   **System**: History (Undo/Redo), Placeholder, Markdown support, Text Alignment.

---

## 🛠️ Extension System: Building Your Own

AgentEdit is designed to be extended. You can build custom nodes or marks with ease.

```ts
const MyCustomMark = {
  name: "customMark",
  addCommands: () => ({
    setMyMark: () => (state, dispatch) => {
      // Your custom ProseMirror logic here
      return true;
    },
  }),
  addKeyboardShortcuts: () => ({
    "Mod-Alt-x": () => editor.runCommand("setMyMark"),
  }),
};

// Use it!
extensions: [Essentials, MyCustomMark]
```

---

## 🧠 The Future: Agentic Editing

We are moving towards a future where the editor is not just a tool, but a collaborator.

*   **Interception Layer**: All commands can be routed through an AI agent for validation.
*   **Natural Language API**: `editor.request("make this text sound more professional")`.
*   **Context-Aware**: Agents that understand your document structure and suggest structural improvements.

---

## 📄 License

AgentEdit is open-source under the **MIT License**.
Built with ❤️ by **ArkCabin**.

# Arkpad: The Complete Developer Guide

Welcome to the official documentation for **Arkpad**, a high-performance, modular, and agent-ready rich text editor framework built on ProseMirror.

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

### Example: Basic Setup

```tsx
import { useArkpadEditor, ArkpadEditorContent } from "@arkpad/react";
import { Essentials } from "@arkpad/core";

export function SimpleEditor() {
  const editor = useArkpadEditor({
    extensions: [Essentials],
    content: "<p>Start your journey with Arkpad.</p>",
  });

  return <ArkpadEditorContent editor={editor} />;
}
```

---

## 🎨 Headless UI: Tailwind CSS & Shadcn Integration

Arkpad is **100% headless**. It does not come with any pre-styled UI, giving you full creative freedom. You can build your own "Toolbox" using **Tailwind CSS** and **Shadcn UI** components.

### Building a Shadcn-style Toolbar

Because `useArkpadEditor` is a hook, you can pass the `editor` instance to any component, such as a custom Toolbar or Toolbox.

```tsx
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, Heading2 } from "lucide-react";

const Toolbar = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 bg-background border rounded-md shadow-sm">
      <Toggle
        size="sm"
        pressed={editor.isActive("strong")}
        onPressedChange={() => editor.runCommand("toggleBold")}
      >
        <Bold className="w-4 h-4" />
      </Toggle>

      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.runCommand("toggleHeading", { level: 2 })}
      >
        <Heading2 className="w-4 h-4" />
      </Toggle>
      
      {/* Add more Shadcn components here! */}
    </div>
  );
};
```

---

## 🍦 The Vanilla Experience (`@arkpad/core`)

For those not using React, the core library provides a powerful class-based API.

```ts
import { ArkpadEditor, Essentials } from "@arkpad/core";

const editor = new ArkpadEditor({
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

Arkpad is designed to be extended. You can build custom nodes or marks with ease.

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

Arkpad is open-source under the **MIT License**.
Built with ❤️ by **ArkCabin**.

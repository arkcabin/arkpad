# Arkpad Customization & Extension Guide

Arkpad is built on a "Headless + Extensions" architecture. This guide shows you how to build your own features, from simple buttons to complex interactive nodes.

---

## 1. The Extension Template (Super Easy)

Every feature in Arkpad is an extension. Copy this template to start building your own:

```typescript
import { Extension } from "@arkpad/core";

export const MyCustomExtension = Extension.create({
  name: "myCustomExtension",

  // 1. Initial configuration
  addOptions() {
    return {
      defaultColor: "red",
    };
  },

  // 2. Add custom logic (Commands)
  addCommands() {
    return {
      setMyFeature: (value: string) => (state, dispatch) => {
        console.log("Feature activated with:", value);
        return true;
      },
    };
  },

  // 3. Add Keyboard Shortcuts
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-x": () => this.editor.runCommand("setMyFeature", "shortcut"),
    };
  },

  // 4. Add Markdown-style Input Rules
  addInputRules() {
    return [
      // Typing '(c)' will trigger this
      new InputRule(/\(c\)$/, (state, match, start, end) => {
        return state.tr.replaceWith(start, end, state.schema.text("©"));
      }),
    ];
  },
});
```

---

## 2. Building the UI (The Easy Way)

Once your extension is registered, building a toolbar is simple using the `EditorButton` component in React.

```tsx
import { EditorButton } from "@arkpad/react";

function Toolbar() {
  return (
    <div className="flex gap-2">
      {/* Automatically handles enabled/disabled/active states */}
      <EditorButton
        command="toggleBold"
        name="strong"
        className="btn"
        activeClassName="bg-blue-500 text-white"
      >
        Bold
      </EditorButton>

      {/* Pass arguments easily */}
      <EditorButton command="insertTable" args={[{ rows: 5, cols: 5 }]} className="btn">
        Insert 5x5 Table
      </EditorButton>
    </div>
  );
}
```

---

## 3. Global Attributes (Theming & Metadata)

Use `addGlobalAttributes` to inject logic into _all_ nodes of a certain type without modifying them individually.

```typescript
addGlobalAttributes() {
  return [
    {
      types: ["heading", "paragraph"],
      attributes: {
        // Add a 'data-id' to every block for easy linking
        id: {
          default: null,
          renderHTML: (attributes) => ({ "data-arkpad-id": attributes.id }),
        },
      },
    },
  ];
}
```

---

## 4. Middleware (Interceptors)

The `onInterceptor` hook allows you to control the flow of data. Use it for permissions, logging, or auto-saving.

```tsx
const editor = useArkpadEditor({
  onInterceptor: ({ transaction, editor }) => {
    // Example: Prevent changes if the document is 'locked'
    if (myAppState.isLocked) {
      return false; // Blocks the change entirely
    }

    return true; // Allow the change
  },
});
```

---

## 5. Summary Checklist for Developers

1.  **Logic?** Put it in `addCommands` or `addProseMirrorPlugins`.
2.  **Shortcuts?** Use `addKeyboardShortcuts`.
3.  **UI?** Use `EditorButton` and `useEditorState` in React.
4.  **Permissions?** Use `onInterceptor`.
5.  **Data?** Use `addStorage` and `this.storage`.

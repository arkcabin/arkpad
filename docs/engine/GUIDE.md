# Arkpad Engine: The Foundation

## Philosophy

The **Engine** is the "Skeleton" of the editor. It is designed to be **Simple, Fast, and Lightweight**.

Unlike heavy "Starter Kits" that include 20+ extensions you might not need, the `Engine` includes only the 3 mandatory nodes required for a ProseMirror document to exist:

1.  **Document** (`doc`): The root container.
2.  **Paragraph** (`paragraph`): The standard block container for text.
3.  **Text** (`text`): The inline content.

## Why use `Engine`?

- **Performance**: A smaller schema means faster parsing and rendering.
- **Flexibility**: You build exactly what you need on top of the Engine.
- **Simplicity**: One import instead of three.
- **Smart**: The Engine automatically maps commands (like `toggleBold`) to their respective marks/nodes for active state detection.
- **Chainable**: All extensions use Tiptap-like `chain().toggleMark().run()` syntax.

## Usage

### The "Smart" Way (Recommended)

```typescript
import { Engine } from "@arkpad/core";

const editor = useArkpadEditor({
  extensions: [
    Engine, // Just the Engine. No spread needed!
    Bold, // The Engine knows toggleBold -> strong
  ],
});
```

### UI Integration (Zero Config)

The `EditorButton` now automatically detects active states using the Engine's smart mapping.

```tsx
// Before: Needed 'name="strong"' to work
<EditorButton command="toggleBold" name="strong" />

// Now: Just works!
<EditorButton command="toggleBold" />
```

## Saving Content (The Performance-First Way)

To maintain ultra-fast performance, Arkpad does not serialize the document to HTML/JSON on every keypress. Instead, we recommend saving content when the user stops typing (debounced) or when the editor loses focus.

```typescript
const editor = useArkpadEditor({
  extensions: [StarterKit],
  onUpdate: ({ editor }) => {
    // DO NOT: console.log(editor.getHTML()) here!
    // It will cause typing lag on large documents.
  },
});

// THE RIGHT WAY: Debounce your save function
const handleSave = debounce(() => {
  const html = editor.getHTML();
  saveToDatabase(html);
}, 2000);
```

For more details on why this is necessary, see the [Performance Architecture Guide](../architecture/PERFORMANCE.md).

## How it works (Smart Mapping)

Extensions now declare an `activeMapping`. For example, the Bold extension defines:

```typescript
activeMapping: {
  toggleBold: "strong";
}
```

When `editor.isActive("toggleBold")` is called, the Engine looks up this mapping and checks the `strong` mark automatically.

## Chain Syntax (Tiptap-like DX)

All extensions now use the clean `chain()` syntax for commands. This provides reliable transaction handling:

```typescript
// Extension command implementation
addCommands() {
  return {
    toggleBold: () => ({ chain }: ArkpadCommandProps) => {
      return chain().toggleMark("strong").run();
    },
  };
}
```

The `CommandManager` properly merges all steps into a single transaction, fixing the "silent killer" bug where sub-transactions were disconnected.

## Comparison: Engine vs. StarterKit

| Feature       | `Engine`               | `@arkpad/starter-kit`                      |
| :------------ | :--------------------- | :----------------------------------------- |
| **Nodes**     | Doc, Paragraph, Text   | Doc, Paragraph, Text, Heading, Lists, etc. |
| **Marks**     | None                   | Bold, Italic, Underline, etc.              |
| **Size**      | **Tiny**               | Larger                                     |
| **Smart UI**  | **Yes (Auto Mapping)** | No (Manual config needed)                  |
| **Chain API** | **Yes**                | No (Legacy pattern)                        |

## Best Practices

1.  **Always start with `Engine`**: Even if you plan to add many extensions later, starting with the Engine makes your base clear.
2.  **Trust the Engine**: Don't manually specify `name` in `EditorButton` unless you have a custom use case.
3.  **Keep it Modular**: Add extensions one by one to maintain the "Best of Best" performance.
4.  **Use Chain Syntax**: When creating custom extensions, always use `chain().command().run()` for reliable transaction handling.

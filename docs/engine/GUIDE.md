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

## Usage

### Before (Manual)

```typescript
import { createDocument, createParagraph, createText } from "@arkpad/core";

const editor = useArkpadEditor({
  extensions: [
    createDocument(),
    createParagraph(),
    createText(),
    Bold, // Your custom extension
  ],
});
```

### After (Using Engine)

```typescript
import { Engine } from "@arkpad/core";

const editor = useArkpadEditor({
  extensions: [
    Engine, // The "Engine" power (Single object, no spread needed)
    Bold, // Your custom extension
  ],
});
```

## Comparison: Engine vs. StarterKit

| Feature      | `Engine`                | `@arkpad/starter-kit`                      |
| :----------- | :---------------------- | :----------------------------------------- |
| **Nodes**    | Doc, Paragraph, Text    | Doc, Paragraph, Text, Heading, Lists, etc. |
| **Marks**    | None                    | Bold, Italic, Underline, etc.              |
| **Size**     | **Tiny**                | Larger                                     |
| **Use Case** | Custom/Specific editors | Full-featured editors                      |

## Best Practices

1.  **Always start with `Engine`**: Even if you plan to add many extensions later, starting with the Engine makes your base clear.
2.  **Combine with Marks**: The Engine provides the structure; Marks (like Bold) provide the styling.
3.  **Keep it Modular**: Add extensions one by one to maintain the "Best of Best" performance.

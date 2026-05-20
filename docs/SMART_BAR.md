# Arkpad Smart Bar (Contextual Floating Menu)

The Smart Bar is Arkpad's world-class floating menu system. It is designed to be **Ultra-Fast**, **Light-Weight**, and **Highly Flexible**, providing a Notion-like contextual experience with zero performance overhead.

---

## 1. The "Virtual Mirror" Engine

Unlike traditional floating menus that rely on heavy React state updates for every mouse movement, Arkpad uses a **CSS Variable-driven positioning engine**.

### Why it's better:

- **120fps Movement:** Positioning is handled by a headless core plugin synchronized with the browser's `requestAnimationFrame`.
- **Zero React Jitter:** The menu moves at native speeds by updating CSS variables (`--sb-x`, `--sb-y`) directly on the DOM, bypassing React's reconciliation cycle during movement.
- **Adaptive Flip:** Automatically flips to the top or bottom and stays within viewport boundaries to prevent content clipping.

---

## 2. The Slot-Based API

Building a contextual menu is "super easy" using the `SmartBar` component. You can define multiple groups that "morph" based on the editor's state.

```tsx
import { SmartBar, EditorButton } from "@arkpad/react";

function MyToolbar() {
  return (
    <SmartBar>
      {/* Group 1: Only show when text is selected */}
      <SmartBar.Group showIf={(editor) => !editor.getSelection().empty}>
        <EditorButton command="toggleBold" name="strong">
          Bold
        </EditorButton>
        <EditorButton command="toggleItalic" name="em">
          Italic
        </EditorButton>
      </SmartBar.Group>

      {/* Group 2: Only show when inside a table */}
      <SmartBar.Group showIf={(editor) => editor.isActive("table")}>
        <EditorButton command="addColumnAfter">Add Column</EditorButton>
        <EditorButton command="addRowAfter">Add Row</EditorButton>
        <EditorButton command="smartDelete">Delete</EditorButton>
      </SmartBar.Group>
    </SmartBar>
  );
}
```

---

## 3. Pre-Built vs. Custom

Arkpad provides a dual-path architecture:

### The "Easy Path" (Pre-Built)

Use our `SmartBar.Group` and `EditorButton` components to build a professional menu in minutes. Our buttons automatically handle `disabled` and `active` states reactively.

### The "Headless Path" (Build Your Own)

If you want a completely custom UI (like a radial menu or a sidebar following the cursor), you can use the low-level `BubbleMenu` portal and listen to the CSS variable updates.

---

## 4. Performance Tips

- **Keep Groups Focused:** Only use `showIf` logic for large context shifts (e.g., Text vs. Table).
- **Z-Index:** The Smart Bar uses a default Z-Index of `1000` to stay above all other content.
- **Styling:** The `SmartBar` component uses a default "Glassmorphism" style (backdrop-blur). You can override this using the `className` prop.

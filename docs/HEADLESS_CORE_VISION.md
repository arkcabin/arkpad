# Headless Core Vision: Advanced Features & Gaps

This document outlines the technical vision for the next evolution of Arkpad's headless core. It details the "Gaps" identified for a world-class developer experience and provides examples of how these features will be implemented.

---

## 1. Chained Commands (Fluent API)

**The Problem**: Currently, running multiple commands (e.g., focusing the editor and then toggling bold) requires multiple separate calls, which is verbose and less performant.

**The Vision**: A fluent API that allows batching operations into a single execution.

### Example
```ts
// How it looks now
editor.focus();
editor.runCommand("toggleBold");

// The Future (Chained)
editor.chain()
  .focus()
  .toggleBold()
  .run();
```

---

## 2. Transaction Interception (The "Agent" Hook)

**The Problem**: Developers cannot currently "veto" or modify a transaction before it hits the editor state.

**The Vision**: A middleware-like hook that allows AI or custom logic to intercept changes.

### Example
```ts
const editor = useArkpadEditor({
  onBeforeTransaction: (transaction) => {
    // AI check: Does this change sound professional?
    if (isUnprofessional(transaction.doc.text)) {
      return false; // Veto the change!
    }
    return true; // Proceed
  }
});
```

---

## 3. Selection-Specific React Hooks - Ongoing

**The Problem**: Toolbars often re-render too much because they listen to the entire editor state.

**The Vision**: Fine-grained hooks that only trigger a re-render when a specific condition is met.

### Example
```tsx
function BoldButton({ editor }) {
  // Only re-renders when the 'bold' state actually changes!
  const isBold = useEditorState(editor, (state) => state.isActive("strong"));

  return (
    <button className={isBold ? "active" : ""}>
      Bold
    </button>
  );
}
```

---

## 4. React-Based NodeViews

**The Problem**: Custom nodes (like an "AI Prompt Block") currently require complex ProseMirror Class-based NodeViews.

**The Vision**: Register a plain React component as a NodeView with zero boilerplate.

### Example
```tsx
const AIPromptBlock = ({ node, updateAttributes }) => {
  return (
    <div className="bg-blue-50 p-4 rounded">
      <input 
        value={node.attrs.prompt} 
        onChange={e => updateAttributes({ prompt: e.target.value })}
      />
    </div>
  );
};

// Registered simply as:
extensions: [
  createAIExtension({
    component: AIPromptBlock
  })
]
```

---

## 5. Advanced Event System

**The Vision**: Expand the event surface for deep observability.

- **`onSelectionUpdate`**: Reactive updates for coordinates, active marks, and depth.
- **`onPaste`**: Intercept paste events to handle custom file types or clean HTML.
- **`onTransaction`**: Direct access to the raw ProseMirror transaction for analytics.

---

## 6. Table Management Engine

**The Vision**: A dedicated extension for high-performance table manipulation.

### Example Commands
- `editor.runCommand("insertTable", { rows: 3, cols: 3 })`
- `editor.runCommand("addColumnAfter")`
- `editor.runCommand("mergeCells")`

---
*Status: This document represents the Phase 3 Roadmap. These features are currently under analysis for implementation.*

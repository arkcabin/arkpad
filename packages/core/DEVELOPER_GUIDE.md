# Arkpad Developer Guide

This document explains the advanced architectural patterns used in Arkpad.

## 1. Advanced Command Chaining

Arkpad's command chaining is **State-Aware**. Unlike traditional editors that collect commands and run them in a batch, Arkpad applies each command to a "temporary state" before running the next one.

### How to use:
```typescript
editor.chain()
  .focus('end')
  .insertContent('Hello World')
  .selectAll()
  .toggleBold()
  .run()
```

### Why it's better:
The `.selectAll()` command above correctly perceives the new 'Hello World' text because the state was updated internally after the `.insertContent()` call.

---

## 2. Extension Storage API

Extensions can maintain their own reactive data store that is separate from the document.

### Definition:
```typescript
const CharacterCount = Extension.create({
  name: 'characterCount',
  addStorage() {
    return { characters: 0 }
  },
  onUpdate({ editor }) {
    this.storage.characters = editor.getText().length
  }
})
```

### Accessing Storage:
- **Core**: `editor.storage.characterCount.characters`
- **React**: `const chars = useEditorStorage(editor, 'characterCount', 'characters')`

---

## 3. Global Attributes

You can inject attributes into multiple node types at once without modifying the node extensions themselves.

### Definition:
```typescript
addGlobalAttributes() {
  return [{
    types: ['paragraph', 'heading'],
    attributes: {
      align: {
        default: 'left',
        parseHTML: element => element.style.textAlign || 'left',
        renderHTML: attributes => ({ style: `text-align: ${attributes.align}` })
      }
    }
  }]
}
```

---

## 4. React Integration

### Global Context
Wrap your app in `ArkpadProvider` to access the editor instance anywhere.

```tsx
function MyComponent() {
  const { editor } = useArkpadContext()
  return <button onClick={() => editor.commands.toggleBold()}>Bold</button>
}
```

### Command Proxy
You can call commands directly on `editor.commands` with full TypeScript support.
`editor.commands.toggleBold()` is equivalent to `editor.runCommand('toggleBold')`.

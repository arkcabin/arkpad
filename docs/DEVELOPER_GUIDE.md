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

---

## 5. Dynamic Schema Generation

Arkpad no longer uses a static schema. Instead, it uses the `SchemaBuilder` to compile a schema at runtime based on the extensions provided during initialization.

### Benefits:
- **Modular Nodes/Marks**: Extensions can inject their own schema specifications.
- **Global Injection**: Global attributes are added during the build process, ensuring perfect integration with ProseMirror's internal models.

---

## 7. Cookbook: Common Patterns

### Adding a Custom Class to Header 4
Instead of modifying the core Heading extension, use a Global Attribute to inject styles based on node state.

```typescript
addGlobalAttributes() {
  return [{
    types: ['heading'],
    attributes: {
      class: {
        default: null,
        renderHTML: (attributes) => {
          if (attributes.level === 4) {
            return { class: 'my-custom-h4-styling' }
          }
          return null
        }
      }
    }
  }]
}
```

### Implementing a Word Counter
Use the Storage API and the `onUpdate` hook to keep track of document stats.

```typescript
const WordCounter = Extension.create({
  name: 'wordCounter',
  addStorage() {
    return { count: 0 }
  },
  onUpdate({ editor }) {
    const text = editor.getText()
    this.storage.count = text.split(/\s+/).filter(s => s.length > 0).length
  }
})
```

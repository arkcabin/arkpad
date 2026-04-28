# Arkpad Extension Factory Guide

Arkpad uses a modular, class-based extension system inspired by modern rich text frameworks. This system allows for granular control, high reusability, and powerful inheritance.

## 🧱 The Core Concept: Everything is an Extension
In Arkpad, every feature—from basic formatting like **Bold** to complex logic like **Unique ID assignment**—is an extension. 

The **Extension Factory** is the engine that compiles these extensions into a working ProseMirror editor.

---

## 🛠️ Creating an Extension
To create a new extension, you use the `Extension.create()` method. This provides a clean, declarative API for defining your feature.

```typescript
import { Extension } from '@arkpad/core';

export const MyExtension = Extension.create({
  name: 'myExtension',

  // Default configuration options
  addOptions() {
    return {
      color: 'blue',
    };
  },

  // Private storage for the extension
  addStorage() {
    return {
      counter: 0,
    };
  },

  // Define commands available via editor.commands
  addCommands() {
    return {
      increment: () => ({ storage }) => {
        storage.counter++;
        return true;
      },
    };
  },

  // Map keyboard shortcuts
  addKeyboardShortcuts() {
    return {
      'Mod-i': () => this.editor.commands.increment(),
    };
  },
});
```

---

## 🧬 Inheritance with `.extend()`
One of the most powerful features of Arkpad is the ability to extend existing extensions. This allows you to modify behavior without touching the original source code.

```typescript
// Taking the standard Bold extension and making it "Red"
export const RedBold = Bold.extend({
  renderHTML({ HTMLAttributes }) {
    return ['span', { 
      ...HTMLAttributes, 
      style: 'color: red; font-weight: bold;' 
    }, 0];
  },
});
```

### `this.parent()`
Inside any method of an extended extension, you can call `this.parent()` to execute the original implementation.

```typescript
const SuperUniqueId = UniqueId.extend({
  addGlobalAttributes() {
    return [
      ...this.parent?.() || [], // Keep the original ID attribute
      {
        types: this.options.types,
        attributes: {
          timestamp: { default: Date.now() }, // Add a new timestamp attribute
        },
      },
    ];
  },
});
```

---

## 🧭 The Extension Context (`this`)
Inside extension methods, `this` provides access to everything you need:

*   **`this.editor`**: The main editor instance. Use this to call commands or check state.
*   **`this.options`**: The merged options (defaults + user overrides).
*   **`this.storage`**: The private data store for this extension.
*   **`this.name`**: The unique name of the extension.

---

## 🏗️ How it Works Internally
When the editor starts, it iterates through all registered extensions and:
1.  **Initializes Options**: Merges defaults with user configuration.
2.  **Sets up Storage**: Creates the private data stores.
3.  **Compiles Schema**: Collects all node and mark definitions.
4.  **Injects Plugins**: Collects all ProseMirror plugins, input rules, and keymaps.

This "Compilation" step ensures that the editor remains **Super Ultra Fast**, as the complex logic of merging extensions only happens once at startup.

---

## 🏆 Advanced "Best of Best" Patterns

### 1. 🚀 Priority Management
Sometimes multiple extensions want to handle the same keyboard shortcut or input rule. You can control the execution order using the `priority` property (higher numbers run first).

```typescript
export const HighPriorityBold = Bold.extend({
  priority: 1000, // This will run BEFORE the standard Bold extension
});
```

### 2. 🔗 Inter-Extension Communication
Extensions can share data through their `storage`. One extension can read another's storage to make smart decisions.

```typescript
// Example: An extension that only works if CharacterCount has space
addCommands() {
  return {
    insertSecret: () => ({ editor }) => {
      const charCount = editor.storage.characterCount.characters;
      if (charCount > 1000) return false; // Stop if doc is too long
      // ... logic
    }
  }
}
```

### 3. 🛡️ Schema Guards (Constraints)
You can restrict where nodes can be placed to keep the document structure clean.

```typescript
export const RestrictedHeading = Heading.extend({
  // Only allow headings at the top level, never inside blockquotes
  group: 'block',
  content: 'inline*',
});
```

### 4. ⚡ Performance Best Practices
To keep Arkpad "Super Ultra Fast," follow these rules:

*   **Avoid Full Doc Scans**: Inside `appendTransaction`, always check `tr.docChanged` and try to scan only the affected ranges (using `tr.steps`).
*   **Atomic Updates**: Use `editor.chain()` to group multiple changes into a single transaction.
*   **Lazy Logic**: Move heavy calculations into the `onUpdate` hook and debounce them if necessary, rather than running them inside the ProseMirror plugin cycle.

### 5. 🛠️ The "Meta" Extension Pattern
You can create extensions that don't add any UI but simply "Coordination" logic, like an extension that automatically saves the document to LocalStorage every 5 seconds.

```typescript
export const AutoSave = Extension.create({
  name: 'autoSave',
  onUpdate({ editor }) {
    const json = editor.getJSON();
    localStorage.setItem('arkpad-content', JSON.stringify(json));
  },
});
```

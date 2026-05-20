# Arkpad Performance Architecture

To achieve "Ultra-Fast" and "Ultra-Light" performance, Arkpad uses a specific set of architectural patterns that differ from standard rich-text editors.

## 1. Lazy Data Payloads (Zero-Overhead Update Loop)

In most editors, every keystroke triggers a serialization of the entire document to HTML or JSON. In Arkpad, we have removed this from the core loop.

- **The Problem**: Serializing a 50-page document to HTML takes 50-100ms. If this happens on every keypress, you get massive input lag.
- **The Solution**: The `onUpdate` payload only contains the `editor` and `state`.
- **How to save**: Use `editor.getHTML()` only when you actually need to save (e.g., debounced or on blur).

## 2. Singleton Transaction Pipe

Arkpad's `CommandManager` uses a singleton-like pattern for chaining.

- **The Problem**: Tiptap-like chaining often creates many wrapper objects for each command in a chain (`chain().bold().italic().run()`).
- **The Solution**: The `CommandManager` provides its own instance to the command thunks. This results in **zero object allocation** during command execution, making it ultra-snappy.

## 3. Pre-Indexed Lifecycle Hooks

Extensions can register `onTransaction` and `onUpdate` hooks.

- **The Problem**: Iterating through 50+ extensions to check for hooks on every transaction is slow.
- **The Solution**: During the editor's "Boot" or "Refresh" phase, we pre-index all extensions that use these hooks into specialized arrays (`transactionHooks`, `updateHooks`).
- **Result**: The transaction dispatcher only calls the extensions that actually need to do work.

## 4. O(1) Active State Detection

Smart Mapping (`activeMapping`) allows the editor to know that `toggleBold` relates to the `strong` mark.

- **The Problem**: Searching through the extension registry for these mappings during UI rendering is slow.
- **The Solution**: We build a flat lookup table (`activeMappings`) at boot time.
- **Result**: `editor.isActive('toggleBold')` is a constant-time lookup, ensuring the UI (buttons) never "hangs" or flickers.

## 5. Just-In-Time (JIT) State Application

When running a chain of commands, the `CommandManager` only applies the transaction to the internal state if the _next_ command in the chain needs to see the document changes. This avoids redundant ProseMirror state recalculations.

---

## Future Expansion

To maintain this speed:

1. **Never** call `getHTML()` or `getJSON()` inside an `onUpdate` hook in your extensions.
2. **Always** use the `activeMapping` property if your extension introduces a new command that maps to a mark or node.
3. **Prefer** `chain()` even for single commands to benefit from the singleton transaction pipe.

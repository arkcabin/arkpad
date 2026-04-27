# Guide: Creating React NodeViews

NodeViews are the bridge between ProseMirror's vanilla DOM and React's declarative components. To keep Arkpad "Ultra-Fast" and "Premium," follow these 3 golden rules when building NodeViews.

## 1. Implement `stopEvent`
If your NodeView contains interactive elements (Buttons, Checkboxes, Inputs), you **must** implement `stopEvent`.
Without it, when a user clicks your component, ProseMirror will try to move the text selection into your component, causing flickering or focus loss.

```typescript
stopEvent(event: Event) {
  // Capture all events inside the component container
  return this.container.contains(event.target as Node);
}
```

## 2. Proper Memory Management
Always implement the `destroy()` method. React roots are not automatically cleaned up when ProseMirror removes a node. If you don't unmount, you will create a **memory leak** that slows down the editor over time.

```typescript
destroy() {
  if (this.reactRoot) {
    this.reactRoot.unmount();
    this.reactRoot = null;
  }
}
```

## 3. Use Tailwind for Styling
Avoid inline `style` objects. To ensure users can customize your components, use the `cn` utility and standard Tailwind classes. This allows the editor to automatically follow the user's Dark/Light mode theme.

```typescript
// Good
this.dom.className = "flex items-start gap-2 py-1";

// Bad
this.dom.style.display = "flex";
```

## 4. Immediate Visual Feedback
ProseMirror transactions are fast, but for an "ultra-fast" feel, you should update the DOM styles immediately in your change handler before the transaction finishes.

# Arkpad Menu Engine

The Menu Engine is the centralized positioning service for all floating UI in the Arkpad ecosystem. It resides in the Core package to ensure maximum performance and cross-framework compatibility.

## How it Works

1.  **Headless Math**: The engine calculates coordinates (DOMRects) for selections and insertion points.
2.  **Reactive Storage**: These coordinates are stored in the editor's global storage.
3.  **Atomic Updates**: Framework-specific hooks (like `useMenuPositioner` in React) subscribe to these updates to position menus using GPU-accelerated CSS transforms.

## Benefits

- **Zero Flicker**: Updates are synced with the browser's `requestAnimationFrame`.
- **Zero Layout Thrashing**: Decouples editor rendering from menu rendering.
- **Unified Logic**: One engine handles tables, multi-line selections, and standard text blocks.

## Usage in Extensions

Any extension can register a menu by implementing the `addMenu` method:

```typescript
export const MyExtension = Extension.create({
  addMenu() {
    return {
      type: "bubble",
      shouldShow: ({ state }) => !state.selection.empty,
    };
  },
});
```

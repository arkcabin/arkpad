# @arkpad/extension-highlight

The Highlight extension allows you to mark text with a background color, similar to a physical highlighter.

## Installation

```bash
npm install @arkpad/extension-highlight
```

## Usage

### Commands

#### setHighlight(attributes)

Sets a highlight mark.

```typescript
editor.runCommand("setHighlight", { color: "#ffcc00" });
```

#### toggleHighlight(attributes)

Toggles a highlight mark.

```typescript
editor.runCommand("toggleHighlight");
```

#### unsetHighlight()

Removes all highlight marks.

```typescript
editor.runCommand("unsetHighlight");
```

### Keyboard Shortcuts

- `Mod-Shift-h`: Toggles highlight with default color.

## Configuration

### HTMLAttributes

Custom HTML attributes for the rendered `mark` tag.

```typescript
Highlight.configure({
  HTMLAttributes: {
    class: "my-custom-highlight",
  },
});
```

### color

The default highlight color.

```typescript
Highlight.configure({
  color: "#ffcc00",
});
```

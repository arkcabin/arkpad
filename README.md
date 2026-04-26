# Arkpad

A ProseMirror-based rich text editor framework with a TipTap-inspired API.

## Features

- **Headless** - Full control over rendering
- **Extensible** - Add custom extensions
- **TypeScript** - Built with TypeScript
- **Framework agnostic** - Use with React or vanilla JS

## Getting Started

### Installation

```bash
npm install @arkpad/core
# or
npm install @arkpad/react
```

### Usage

```ts
import { ArkpadEditor } from '@arkpad/core'

const editor = new ArkpadEditor({
  element: document.querySelector('#editor')!,
  content: '<p>Hello World</p>',
})
```

### React

```tsx
import { ArkpadEditorComponent } from '@arkpad/react'

function App() {
  return (
    <ArkpadEditorComponent
      content="<p>Write here...</p>"
      onChange={({ html }) => console.log(html)}
    />
  )
}
```

## Packages

| Package | Description |
|---------|-------------|
| `@arkpad/core` | Core editor (ProseMirror) |
| `@arkpad/react` | React component |
| `@arkpad/app` | Demo application |

## Documentation

- [API Reference](./docs/ARKPAD_API.md)
- [Setup Guide](./docs/SETUP.md)
- [Architecture](./docs/ARCHITECTURE.md)

## License

MIT
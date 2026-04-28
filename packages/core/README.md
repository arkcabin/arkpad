# @arkpad/core

Core engine for the Arkpad rich text editor. Built on top of ProseMirror.

## Features

- **Headless**: UI-agnostic editor core.
- **Modular**: Add only the extensions you need.
- **Markdown**: Full support for Markdown parsing and serialization.
- **Typed**: Written in TypeScript for excellent developer experience.

## Installation

```bash
npm install @arkpad/core
```

## Usage

```typescript
import { ArkpadEditor } from '@arkpad/core';

const editor = new ArkpadEditor({
  element: document.querySelector('#editor'),
  content: '<p>Hello World!</p>',
});
```

## License

MIT

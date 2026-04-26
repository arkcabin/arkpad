# Arkpad API

Arkpad is a ProseMirror-based editor framework with a small, stable API that you can extend with your own commands and plugins.

## Core Factory

```ts
import { createArkpadEditor } from '@arkpad/core'

const editor = createArkpadEditor({
  element: document.querySelector('#editor')!,
  content: '<p>Hello Arkpad</p>',
  autofocus: true,
})
```

## Editor Methods

- `getState()` - return the current ProseMirror state
- `getHTML()` - serialize the document to HTML
- `getJSON()` - serialize the document to JSON
- `getText()` - extract plain text
- `runCommand(name)` - run a registered command by name
- `canRunCommand(name)` - check whether a command can run
- `setContent(content)` - replace the full document content
- `clearContent()` - reset to an empty paragraph
- `focus()` / `blur()` - control editor focus
- `setEditable(boolean)` - toggle editability
- `registerExtension(extension)` - add runtime commands/plugins
- `registerExtensions(extensions)` - add multiple extensions
- `destroy()` - clean up the editor

## Extension Shape

```ts
const myExtension = {
  name: 'mention',
  commands: {
    insertMention: (state, dispatch) => {
      // custom command logic
      return true
    },
  },
}
```

## Built-In Commands

- `toggleBold`
- `toggleItalic`
- `toggleCode`
- `setParagraph`
- `setHeading1`
- `setHeading2`
- `bulletList`
- `sinkListItem`
- `liftListItem`
- `hardBreak`
- `undo`
- `redo`

## React Usage

```tsx
import { ArkpadEditor } from '@arkpad/react'

export function App() {
  return (
    <ArkpadEditor
      content="<p>Write here</p>"
      onChange={({ html }) => console.log(html)}
    />
  )
}
```

## Next Features

Arkpad can grow into a full editor platform with:

- tables
- images
- slash commands
- comments
- collaboration
- tracked changes
- AI editing helpers

# AGENTS.md

## Commands

```bash
npm run dev          # Start demo app (Vite dev server)
npm run build        # Build core -> react -> app
npm run typecheck    # Build packages first, then --workspaces
npm run lint        # ESLint
npm run format      # Prettier write
npm run check       # typecheck + lint + build
```

## Architecture

- `packages/core` - Core editor (ProseMirror), exports `ArkpadEditor`, schema, extensions
- `packages/react` - React component wrapper
- `apps/arkpad` - Demo app (Vite + React + Tailwind)

Entry point: `packages/core/src/editor.ts` → `ArkpadEditor` class

## Key Conventions

- Build first, then typecheck: `npm run build -w @arkpad/core && npm run typecheck --workspaces`
- TypeScript strict mode with `noUncheckedIndexedAccess`
- Package builds output to `dist/`, must run before typecheck
- Editor uses command pattern: `editor.runCommand('bold')`, `editor.getHTML()`, `editor.getJSON()`
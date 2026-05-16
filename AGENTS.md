# AGENTS.md

## Commands

```bash
npm run dev          # Start demo app (Vite dev server) — check if already running first, DON'T restart unless user says "ok"
npm run build        # Build ALL packages (full build — ASK USER FIRST)
npm run typecheck    # Typecheck workspaces
npm run lint        # ESLint
npm run format      # Prettier write
npm run check       # Full typecheck + lint + build (ASK USER FIRST)
npm run test        # Run core tests (112 tests)
npm run test:all    # Run core + all 25 extension tests
```

## Architecture

- `packages/core` - Core editor (ProseMirror), exports `ArkpadEditor`, schema, extensions
- `packages/react` - React component wrapper
- `apps/arkpad` - Demo app (Vite + React + Tailwind)

Entry point: `packages/core/src/editor.ts` → `ArkpadEditor` class

## Key Conventions

- Build only changed packages, not the full monorepo:
  ```bash
  npm run build -w @arkpad/core -w @arkpad/extension-heading
  ```
- Before running a full build (`npm run build`), ASK THE USER for confirmation
- TypeScript strict mode with `noUncheckedIndexedAccess`
- Package builds output to `dist/`, must run before typecheck
- Editor uses command pattern: `editor.runCommand('bold')`, `editor.getHTML()`, `editor.getJSON()`

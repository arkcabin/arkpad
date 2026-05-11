# Arkpad Codebase Full Analysis

## Overview

Arkpad is a modular, enterprise-grade rich text editor framework built on ProseMirror. It provides a sophisticated, developer-first API designed for building powerful, reliable, and highly customizable editing experiences.

## Architecture

### Core Package (`packages/core`)

The core package contains the main editor engine and provides the foundational architecture:

#### Main Components

**ArkpadEditor Class** (`src/core/ArkpadEditor.ts`)
- Main editor instance with 588 lines of comprehensive functionality
- Manages extensions, commands, state, and ProseMirror integration
- Provides public API: `getHTML()`, `getJSON()`, `getText()`, `getMarkdown()`
- Command proxy system with dynamic mapping: `editor.runCommand('bold')`
- Transaction pipeline with interceptor support
- Ghost text API for AI autocomplete functionality

**Sub-Manager Architecture**
- `ExtensionManager` - Handles extension registration and lifecycle
- `StateManager` - Manages ProseMirror state and snapshots
- `DispatchEngine` - Handles transaction dispatching with interceptors
- `SelectionService` - Manages cursor and virtual selections
- `ContentService` - Handles content serialization/deserialization
- `SearchService` - Provides search and replace functionality
- `HookManager` - Manages extension hooks and lifecycle events

#### Extension System

**Core Extensions** (`src/extensions/index.ts`)
- `Engine` - Base infrastructure with 15+ built-in extensions
- `BaseCommands` - Global command registry with 15 core commands
- `Document`, `Paragraph`, `Text`, `HardBreak` - Basic content nodes
- UI Nodes: Button, Card, Spacer, Divider, Container, Grid, Video, Icon, Badge, Alert, Tabs, Accordion
- Infrastructure: Unique ID, Focus Events, Clipboard, Keymaps
- UX: Dropcursor, Gapcursor, Ghost Text, Focus Decorator, Drop Handler

#### SDK & API Design

**Extension SDK** (`src/sdk/`)
- `Extension.create()` - Base extension factory
- `Node.create()` - Node extension factory  
- `Mark.create()` - Mark extension factory
- Utility functions for ProseMirror integration

**Command System**
- Chained commands: `editor.chain().toggleBold().toggleItalic().run()`
- Command availability checking: `editor.canRunCommand('bold')`
- Dynamic command proxy with runtime resolution

## Extension Packages (30 Total)

### Typography Extensions
- `extension-bold` - Bold text with **Mod-B** shortcut
- `extension-italic` - Italic text with **Mod-I** shortcut  
- `extension-underline` - Underlined text with **Mod-U** shortcut
- `extension-strike` - Strikethrough text
- `extension-code` - Inline code formatting
- `extension-superscript` - Superscript text (^)
- `extension-subscript` - Subscript text (_)

### Structure Extensions
- `extension-heading` - Headings 1-4 with hierarchy
- `extension-blockquote` - Blockquote formatting
- `extension-horizontal-rule` - Divider lines
- `extension-image` - Image insertion and manipulation
- `extension-table` - Full table support with `prosemirror-tables`
- `extension-section` - Document sections
- `extension-columns` - Multi-column layouts

### List Extensions  
- `extension-bullet-list` - Unordered bullet lists
- `extension-ordered-list` - Numbered ordered lists
- `extension-task-list` - Task lists with checkboxes
- `extension-list-item` - List item base component

### Tool Extensions
- `extension-highlighter` - Drawing/highlighting mode
- `extension-eraser` - Eraser tool for corrections
- `extension-search` - Search and replace functionality
- `extension-ai` - AI integration and autocomplete
- `extension-highlight` - Text highlighting

### UI Extensions
- `extension-bubble-menu` - Contextual bubble menu
- `extension-floating-menu` - Floating toolbar
- `extension-drag-drop` - Drag and drop functionality
- `extension-builder-ui` - Page builder UI components

### Utility Extensions
- `extension-alignment` - Text alignment (left, center, right, justify)
- `extension-link` - Link creation and management
- `extension-markdown` - Markdown import/export
- `extension-code-block` - Code block formatting

## React Package (`packages/react`)

### React Integration

**Hooks**
- `useArkpadEditor` - Main editor hook with lifecycle management
- `useEditorState` - State subscription and updates
- `useSelection` - Selection tracking and management
- `useMenuPositioner` - Menu positioning logic

**Components**
- `ArkpadEditorContent` - Main editor renderer
- `BubbleMenu` - Contextual menu component
- `FloatingMenu` - Floating toolbar component
- `SmartBar` - Intelligent toolbar
- `EditorButton` - Toolbar button component

**State Management**
- Zustand-based editor store
- Context providers for editor instance
- Reactive state updates and subscriptions

### Features
- TypeScript strict mode with `noUncheckedIndexedAccess`
- React 19+ support
- Tailwind CSS integration
- Component composition patterns

## Demo App (`apps/arkpad`)

### Application Structure

**Main App** (`src/App.tsx`)
- Full editor showcase with StarterKit
- Interactive toolbar with Bold, Italic, List controls
- Responsive design with Tailwind CSS

**Router System** (`src/Router.tsx`)
- React Router with lazy loading
- 10+ individual extension demos
- Builder mode with device simulation
- Sidebar navigation and top bar controls

**Demo Components** (`src/demos/`)
- Individual extension showcases
- `BoldDemo`, `ItalicDemo`, `UnderlineDemo`, etc.
- `TableDemo` with advanced table features
- `BuilderDemo` for page building

**Studio Context**
- Device simulation (desktop, tablet, mobile)
- Edit/Preview mode switching
- Sidebar and property panel management

### Technology Stack
- Vite for development and building
- React Router for navigation
- Tailwind CSS for styling
- Lucide React for icons
- TypeScript with strict configuration

## Build System & Architecture

### Monorepo Structure
- **Workspace**: 30+ packages using npm workspaces
- **Build Pipeline**: TypeScript compilation with `tsc`
- **Package Management**: npm with strict engine requirements (Node 20+, npm 10+)

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "jsx": "react-jsx"
  }
}
```

### ESLint Configuration
- TypeScript ESLint with recommended rules
- React Hooks plugin for React components
- Relaxed `@typescript-eslint/no-explicit-any` for ProseMirror compatibility
- Separate configs for packages and apps

### Build Scripts
```json
{
  "dev": "npm run dev -w @arkpad/app",
  "build": "Builds all packages in dependency order",
  "typecheck": "Type checking across workspaces", 
  "lint": "ESLint across all packages",
  "check": "build + typecheck + lint"
}
```

## Key Features & Capabilities

### Performance Optimizations
- Extreme performance for large documents
- Optimized transaction batching
- Efficient command chaining
- Virtual DOM updates

### Developer Experience
- 100% modular architecture
- Type-safe with first-class TypeScript
- Headless design for complete UI freedom
- Command pattern for easy automation

### Advanced Features
- Native search and replace API
- Painting tools (Highlighter, Eraser)
- AI integration with ghost text
- Drag and drop support
- Multi-device responsive design

### Extension Architecture
- Priority-based extension loading
- Interceptor pipeline for middleware
- Hook system for lifecycle events
- Dynamic extension registration

## API Patterns

### Command Pattern
```typescript
// Single command
editor.runCommand('toggleBold')

// Chained commands  
editor.chain().toggleBold().toggleItalic().run()

// Check availability
editor.canRunCommand('bold')
```

### Extension Registration
```typescript
const extension = Extension.create({
  name: 'myExtension',
  addCommands() { /* ... */ },
  addKeyboardShortcuts() { /* ... */ },
  addInputRules() { /* ... */ }
})
```

### React Integration
```typescript
const editor = useArkpadEditor({
  extensions: [StarterKit],
  content: '<h1>Hello World</h1>'
})
```

## Development Workflow

### Package Development
1. Create extension package in `packages/extension-*`
2. Implement extension using SDK
3. Add TypeScript configuration
4. Build and test with `npm run build`

### Integration Testing
1. Add demo in `apps/arkpad/src/demos/`
2. Update router configuration
3. Test with development server
4. Verify TypeScript types

### Build Process
1. Core package builds first
2. Extensions build in parallel
3. React package builds after core
4. Demo app builds last

## Quality Assurance

### Type Safety
- Strict TypeScript configuration
- Comprehensive type definitions
- ProseMirror type re-exports
- Extension type contracts

### Code Quality
- ESLint with TypeScript rules
- Prettier formatting
- Husky git hooks
- Changeset version management

### Testing Strategy
- Individual extension demos
- Integration testing in demo app
- Type checking across workspaces
- Build verification

## Summary

Arkpad represents a sophisticated approach to rich text editing, combining:

- **Modular Architecture** - 30+ focused extensions
- **Developer Experience** - TypeScript-first, React integration
- **Performance** - Optimized for large documents
- **Flexibility** - Headless design, complete UI freedom
- **Modern Stack** - React 19, Vite, Tailwind CSS

The codebase demonstrates enterprise-grade software engineering practices with comprehensive documentation, type safety, and a well-structured monorepo architecture suitable for large-scale development teams.

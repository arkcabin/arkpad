# Arkpad Strategic Roadmap

This document outlines the phased development strategy for the Arkpad Hybrid Editor, focusing on bridging the gap between Structured Content and Visual Design.

## Core Philosophy: "Content-First, Design-Next"

Our mission is to build a system that maintains the absolute integrity of a structured document (like Notion) while providing the visual flexibility of a layout builder (like GrapesJS).

---

## 📘 Page Builder Specification

**Reference Document:** `docs/PAGE_BUILDER_FULL_GRAPESJS.md`

This specification defines our full GrapesJS-like page builder implementation. It includes:

- Full block registry system
- Multi-column layouts
- Complete style manager (7 tabs)
- Component library (10+ components)
- Template library (6+ templates)
- Layers panel
- Pages management

---

## Phase 1: Structural Intelligence (Current Focus)

**Goal:** Perfect the block-level interaction and document governance.

- [x] **Block-Level Selection:** Implement professional hover-to-reveal drag handles.
- [x] **Advanced Drag-and-Drop:** Auto-scrolling engine for long documents and reactive "Gap" indicators.
- [x] **Layout Containers:** Robust `Section` and `Columns` nodes with strict structural rules.
- [x] **Preview Engine:** Seamless transition between "Edit" and "Preview" modes.
- [x] **Device Preview:** Desktop/Tablet/Mobile toggle in header.
- [ ] **Multi-Column Resizing:** Dynamic gutter manipulation for layout blocks.
- [ ] **Insertion UI:** Floating "+" menus between blocks for quick content addition.

### Phase 1 Implementation Status

- BlockHandle extension ✅
- DragDrop extension with auto-scroll ✅
- Section node ✅
- Columns/Column nodes (planned)
- DevicePreview in Router ✅

---

## Phase 2: Visual Builder UI (In Progress)

**Goal:** Build the full GrapesJS-like interface with panels and controls.

### Left Panel

- [ ] **Block Panel** - Searchable block palette with categories
- [ ] **Layers Panel** - Document tree with show/hide/lock
- [ ] **Pages Panel** - Multi-page management

### Right Panel

- [ ] **Style Manager** - Full visual styling (Dimensions, Spacing, Typography, Background, Border, Flexbox, Extra)
- [ ] **Trait Manager** - Block-specific properties (ID, Class, Link, Image attributes)

### Header

- [ ] **Device Toggle** - Already implemented
- [ ] **Zoom Control** - Canvas zoom 50%-150%
- [ ] **Context Menu** - Right-click menu with actions

### Implementation Files (Planned)

- `packages/core/src/services/BlockRegistry.ts`
- `packages/extension-columns/`
- `packages/react/src/components/Builder/BlockPanel.tsx`
- `packages/react/src/components/Builder/StylePanel.tsx`
- `packages/react/src/components/Builder/LayersPanel.tsx`

---

## Phase 3: Design & Attributes

**Goal:** Introduce visual styling capabilities without breaking the content schema.

- [ ] **Style Manager:** A global sidebar panel to manage colors, spacing, and typography.
- [ ] **Attribute System:** Enable blocks to store design metadata (backgroundColor, borderRadius, shadow).
- [ ] **Theme Tokens:** Centralized CSS variable management (Design Tokens).
- [ ] **Responsive Controls:** Mobile/Tablet/Desktop styling overrides.

### Component Library

- [ ] Hero section
- [ ] Features grid (3-column)
- [ ] Pricing cards
- [ ] Testimonials
- [ ] CTA banner
- [ ] Stats highlights
- [ ] Team section
- [ ] Image gallery
- [ ] Footer
- [ ] Contact form

---

## Phase 4: Templates & Export

**Goal:** Full template system and export options.

### Templates

- [ ] Landing Page
- [ ] Blog Post
- [ ] About Page
- [ ] Contact Page
- [ ] Pricing Page
- [ ] Portfolio

### Export

- [ ] HTML (semantic, no inline styles)
- [ ] JSON (full data)
- [ ] HTML + CSS (separate)
- [ ] Template export/import

---

## Phase 5: Intelligence & Ecosystem

**Goal:** Empower users with AI and third-party integrations.

- [ ] **AI Layout Generator:** Generate full section structures from natural language prompts.
- [ ] **Template Library:** Export and import reusable block patterns.
- [ ] **Plugin SDK:** Allow developers to build custom visual design traits.
- [ ] **GrapesJS Import:** Convert existing GrapesJS templates.

---

## Technical Notes

### Block Registry API

```typescript
// Register a block
editor.registerBlock({
  type: "hero",
  label: "Hero Section",
  icon: HeroIcon,
  category: "components",
  create: () => ({ type: "section", content: [...] }),
  styleConfig: { backgroundColor: true, padding: true }
});
```

### Schema Structure

```
doc → section+ → (block | columns)+
columns → column+
column → block+
```

---

## Tiptap Feature Parity

Extensions and features that Arkpad is missing compared to Tiptap, ranked by priority.

### ✅ Already Built (Arkpad Unique Advantages)

| Feature                    | Notes                                                          |
| -------------------------- | -------------------------------------------------------------- |
| **Governance System**      | Bitmask node-role validation with auto-healing                 |
| **Shadow Engine**          | Virtual state simulation for command chains with telemetry     |
| **Interceptor Middleware** | Sync/async transaction pipeline (AI-aware)                     |
| **Ghost Text**             | Built-in AI autocomplete decoration rendering                  |
| **Painting Tools**         | Highlighter/Eraser mode for batch formatting                   |
| **Virtual Selections**     | Remote cursor decorators for collaboration                     |
| **AI Extension**           | Built-in `aiComplete` / `aiSummarize` with agentic interceptor |
| **Menu Engine**            | Declarative bubble/floating menu positioning system            |
| **Structural Healer**      | `appendTransaction` plugin that auto-fixes invalid nesting     |

### 🔨 High Priority

| Extension                      | Why It Matters                                                                                                                                            | Estimated Effort |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Placeholder**                | CSS `:empty::before` only works for truly empty docs. Need a proper ProseMirror decoration-based placeholder that shows when content is deleted/replaced. | 1-2 days         |
| **Font Family / Size / Color** | Required for any document styling beyond basic bold/italic/alignment. Each is a mark with `style` attribute rendering.                                    | 2-3 days each    |
| **Typography**                 | Smart quotes `" "` → `"""`, em-dash `--` → `—`, ellipsis `...` → `…`, copyright `(c)` → `©`. Simple input rules.                                          | 1 day            |

### 🏗️ Medium Priority

| Extension            | Why It Matters                                                                                                | Estimated Effort |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Mention**          | @-mention autocomplete with filtered popover list. Requires `DecorationSet` + plugin for suggestion dropdown. | 3-4 days         |
| **Emoji**            | `:smile:` autocomplete with emoji picker popover. Similar architecture to Mention.                            | 3-4 days         |
| **YouTube / Iframe** | Embed media via URL paste or node insert. Needs `TrackUtils.parseHTML` and node view.                         | 1-2 days         |

### 🔧 Low Priority

| Extension                | Why It Matters                                                                     | Estimated Effort |
| ------------------------ | ---------------------------------------------------------------------------------- | ---------------- |
| **Details / Summary**    | Collapsible `<details>` / `<summary>` HTML node.                                   | 2 days           |
| **Math (KaTeX)**         | LaTeX math rendering with `katex` library. Inline `$x^2$` and display `$$...$$`.   | 3-4 days         |
| **Collaboration (Y.js)** | Real-time multi-cursor with Y.js sync. Requires `y-prosemirror` adapter.           | 5-7 days         |
| **TOC**                  | Auto-generated table of contents from heading structure. Read-only node or plugin. | 1-2 days         |

### 🏗️ Infrastructure Gaps

| Item                  | Notes                                                                |
| --------------------- | -------------------------------------------------------------------- |
| **Test suite**        | Zero tests across the entire monorepo (no unit, integration, or E2E) |
| **CI pipeline**       | No GitHub Actions or CI config found                                 |
| **API documentation** | No generated TypeScript API docs                                     |

---

## Related Documentation

- `docs/PAGE_BUILDER_FULL_GRAPESJS.md` - Full specification
- `docs/PAGE_BUILDER_SPEC.md` - Initial version

---

_Last Updated: May 13, 2026_

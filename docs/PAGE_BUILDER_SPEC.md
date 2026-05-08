# Arkpad Page Builder Specification

A comprehensive specification for transforming Arkpad into a GrapesJS-like visual page builder while maintaining ProseMirror's structured content integrity.

**Version:** 1.0  
**Status:** Draft for Discussion  
**Last Updated:** May 8, 2026

---

## 1. Executive Summary

**Goal:** Transform Arkpad into a GrapesJS-like visual page builder while maintaining ProseMirror's structured content integrity.

**Core Philosophy:** "Content-First, Design-Next"

This specification outlines a modular, extensible page builder system where users can:

- Drag and drop blocks from a sidebar
- Create and use custom blocks
- Style elements visually
- Build multi-column layouts
- Use pre-built components

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Arkpad Editor                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Sidebar   │  │   Canvas    │  │  Inspector  │          │
│  │  (Blocks)   │  │  (Editor)   │  │  (Styles)   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
├─────────────────────────────────────────────────────────────┤
│                    Block Registry                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ type: "section" → renders as <section>                  ││
│  │ type: "columns" → renders as flex container             ││
│  │ type: "hero" → custom render + preset content            ││
│  │ type: "custom" → user-defined block                       ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  ProseMirror Schema                                         │
│  doc → section+ → block+                                     │
│  doc → section+ → columns → column+ → block+                │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Components

### 3.1 Block Registry System

**Purpose:** Central registry for all available blocks. Enables dynamic block registration and lookup.

#### Interface

```typescript
type BlockCategory = "layout" | "typography" | "media" | "components" | "custom";

interface BlockStyleConfig {
  backgroundColor?: boolean;
  padding?: boolean;
  margin?: boolean;
  borderRadius?: boolean;
  textAlign?: boolean;
  minHeight?: boolean;
  border?: boolean;
}

interface BlockOptions {
  backgroundColor?: string;
  padding?: string;
  textAlign?: "left" | "center" | "right";
  // ... other custom options
}

interface BlockDefinition {
  type: string; // Unique identifier: "section" | "columns" | "hero"
  label: string; // Display name: "Section" | "2 Columns" | "Hero"
  icon: React.ReactNode; // Icon component for sidebar
  category: BlockCategory; // Category for grouping in sidebar
  create: (options?: BlockOptions) => ProseMirrorNode; // Factory function
  styleConfig?: BlockStyleConfig; // Which styling options this block supports
  defaultAttrs?: Record<string, any>; // Default attributes
}
```

#### Default Blocks

| Category   | Blocks                                     |
| ---------- | ------------------------------------------ |
| Layout     | Section, Columns, Container                |
| Typography | Heading, Paragraph, List, Quote, Code      |
| Media      | Image, Video, Divider                      |
| Components | Hero, Features, Pricing, CTA, Testimonials |
| Custom     | User-defined blocks                        |

### 3.2 Column System

**Purpose:** Enable multi-column layouts within sections.

#### Data Structure

```typescript
// Schema hierarchy:
// doc → section+ → columns → column+ → block+

// Columns node (container)
{
  type: "columns",
  attrs: {
    gap: "1rem",           // Gap between columns
    align: "top" | "middle" | "bottom"  // Vertical alignment
  },
  content: "column+"
}

// Column node (individual column)
{
  type: "column",
  attrs: {
    width: "50%",         // Width (px, %, or flex ratio)
    backgroundColor: null,
    minWidth: "100px"
  },
  content: "block+"
}
```

#### Column Operations

| Command                        | Description            | Example                                         |
| ------------------------------ | ---------------------- | ----------------------------------------------- |
| `addColumn()`                  | Add column at end      | `editor.runCommand("addColumn")`                |
| `removeColumn(index)`          | Remove column at index | `editor.runCommand("removeColumn", 2)`          |
| `setColumnWidth(index, width)` | Set column width       | `editor.runCommand("setColumnWidth", 0, "33%")` |
| `moveColumn(from, to)`         | Reorder columns        | `editor.runCommand("moveColumn", 0, 2)`         |

### 3.3 Style Inspector Panel

**Purpose:** Visual style editor for selected blocks.

#### Supported Properties

| Property        | Type              | Default     | UI Control       |
| --------------- | ----------------- | ----------- | ---------------- |
| backgroundColor | color             | transparent | Color picker     |
| padding         | string            | "2rem"      | Slider + presets |
| margin          | string            | "0"         | Slider + presets |
| borderRadius    | string            | "0"         | Slider + presets |
| textAlign       | left/center/right | left        | Button group     |
| minHeight       | string            | auto        | Input            |
| border          | string            | none        | Input            |

#### Style Presets

```typescript
const StylePresets = {
  padding: ["0", "1rem", "2rem", "4rem"],
  borderRadius: ["0", "4px", "8px", "16px", "9999px"],
  gap: ["0", "0.5rem", "1rem", "2rem"],
};
```

---

## 4. API Design

### 4.1 Block Registration API

```typescript
// Register a built-in block
editor.registerBlock({
  type: "hero",
  label: "Hero Section",
  icon: <HeroIcon />,
  category: "components",
  create: () => ({
    type: "section",
    attrs: { padding: "4rem", backgroundColor: "#f9fafb" },
    content: [
      { type: "heading", attrs: { level: 1 }, content: "Welcome" },
      { type: "paragraph", content: "Your subtext here" }
    ]
  }),
  styleConfig: {
    backgroundColor: true,
    padding: true,
    textAlign: true
  }
});

// Register custom block
editor.registerBlock({
  type: "myCustomBlock",
  label: "My Block",
  icon: "✨",
  category: "custom",
  create: () => ({ type: "section", content: [...] }),
  styleConfig: { ... }
});

// Unregister block
editor.unregisterBlock("hero");

// Get all registered blocks
const blocks = editor.getRegisteredBlocks();
```

### 4.2 Block Palette API

```typescript
// Get blocks by category
const layoutBlocks = editor.getBlocksByCategory("layout");
const allBlocks = editor.getAllBlocks();

// Filter blocks
const searchResults = editor.searchBlocks("heading");
```

### 4.3 Quick Insert API

```typescript
// Trigger quick inserter
editor.runCommand("openQuickInserter");

// Type "/" in editor to show searchable block list
// Filter by typing
// Arrow keys to navigate
// Enter to insert
// Escape to close
```

---

## 5. File Structure

```
packages/
├── extension-columns/              (NEW)
│   ├── src/
│   │   ├── index.ts               # Extension entry point
│   │   ├── nodes/
│   │   │   ├── columns.ts         # Columns node definition
│   │   │   └── column.ts          # Column node definition
│   │   ├── commands/
│   │   │   └── index.ts           # addColumn, removeColumn, setColumnWidth
│   │   └── styles.css             # Column layout styles
│   └── package.json
│
├── extension-components/          (NEW)
│   ├── src/
│   │   ├── index.ts               # All component exports
│   │   ├── hero.ts                # Hero component
│   │   ├── features.ts            # Features component (3-column grid)
│   │   ├── pricing.ts            # Pricing cards component
│   │   ├── cta.ts                 # Call-to-action banner
│   │   └── testimonials.ts        # Testimonials component
│   └── package.json
│
├── core/
│   └── src/
│       ├── services/
│       │   └── BlockRegistry.ts   (NEW) - Central block management
│       └── extensions/
│           └── ux/
│               ├── StyleInspector.ts   (NEW) - Style panel logic
│               ├── QuickInserter.ts     (NEW) - "/" command handler
│               └── DragDrop.ts          (UPDATE) - Drop indicators
│
└── react/
    └── src/
        └── components/
            └── Builder/
                ├── BlockPalette.tsx    (NEW) - Sidebar block list
                ├── StylePanel.tsx       (NEW) - Style inspector UI
                ├── ColumnControls.tsx   (NEW) - Column add/remove buttons
                ├── QuickInsert.tsx      (NEW) - "/" popup component
                └── index.ts
```

---

## 6. Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

| Task                  | Files                              | Est. Lines |
| --------------------- | ---------------------------------- | ---------- |
| BlockRegistry service | core/src/services/BlockRegistry.ts | ~80        |
| Column nodes          | extension-columns/                 | ~150       |
| AddColumn command     | extension-columns/commands/        | ~40        |

**Deliverables:**

- Working Column and Columns nodes
- Add/remove column commands
- Block registry with default blocks

### Phase 2: UI Components (Week 2)

| Task                 | Files                  | Est. Lines |
| -------------------- | ---------------------- | ---------- |
| BlockPalette sidebar | react/BlockPalette.tsx | ~120       |
| Drag with indicators | DragDrop update        | ~80        |
| Column add/remove UI | ColumnControls.tsx     | ~100       |

**Deliverables:**

- Drag blocks from sidebar
- Drop indicators showing where blocks will go
- Column management UI (add/remove buttons)

### Phase 3: Style System (Week 3)

| Task                      | Files                  | Est. Lines |
| ------------------------- | ---------------------- | ---------- |
| StyleInspector panel      | react/StylePanel.tsx   | ~200       |
| Style attributes on nodes | section/columns update | ~60        |
| Style presets             | components/styles.css  | ~100       |

**Deliverables:**

- Click block to select
- Style panel shows relevant options
- Changes apply immediately (live preview)

### Phase 4: Components & Templates (Week 4)

| Task                 | Files                 | Est. Lines |
| -------------------- | --------------------- | ---------- |
| Hero, Features, etc. | extension-components/ | ~300       |
| Template library     | templates/index.ts    | ~200       |

**Deliverables:**

- Pre-built components ready to use
- Full page templates (landing, blog, etc.)
- One-click template insertion

---

## 7. Integration with ROADMAP.md

The existing `docs/ROADMAP.md` outlines:

```
Phase 1: Structural Intelligence (Current)
  - [x] Block-Level Selection ✓
  - [x] Advanced Drag-and-Drop ✓
  - [x] Layout Containers (Section) ✓
  - [x] Preview Engine ✓
  - [ ] Multi-Column Resizing ← NEEDS IMPLEMENTATION
  - [ ] Insertion UI ← NEEDS IMPLEMENTATION

Phase 2: Design & Attributes (Next)
  - [ ] Style Manager ← NEW FROM THIS SPEC
  - [ ] Attribute System ← NEW FROM THIS SPEC
  - [ ] Theme Tokens ← NEW FROM THIS SPEC
  - [ ] Responsive Controls ← NEW FROM THIS SPEC
```

**This specification completes:**

- Multi-Column Resizing → Columns extension (Phase 1)
- Insertion UI → QuickInserter "/" command (Phase 1)
- Style Manager → StyleInspector panel (Phase 2)
- Attribute System → Block styleConfig (Phase 2)

---

## 8. Design Decisions

### Q1: Max Columns?

**Decision:** Start with max 4, add setting for unlimited later.

Reason: Most designs use 2-4 columns. Unlimited can cause UX issues.

### Q2: Custom Block Storage?

**Decision:** LocalStorage + Export/Import JSON.

Reason: Simple, portable, no backend required.

### Q3: Default Blocks to Include?

**Decision:**

| Priority | Block     | Reason            |
| -------- | --------- | ----------------- |
| High     | Section   | Already exists    |
| High     | Columns   | Multi-col layouts |
| High     | Heading   | Basic content     |
| High     | Paragraph | Basic content     |
| Medium   | Hero      | Landing pages     |
| Medium   | Image     | Media             |
| Medium   | Divider   | Visual break      |
| Low      | Pricing   | E-commerce        |

### Q4: Naming Convention?

**Decision:** Keep "Section" as the primary container.

Reason: Familiar term, consistent with HTML semantics.

---

## 9. Technical Notes

### ProseMirror Integration

The page builder leverages ProseMirror's schema system:

```typescript
// Section can contain blocks OR columns
const sectionNode = {
  content: "(block | columns)+",
  // This allows: section > paragraph
  // Or: section > columns > column > paragraph
};

// Columns contains only columns
const columnsNode = {
  content: "column+",
  attrs: { gap: { default: "1rem" } },
};

// Column contains blocks
const columnNode = {
  content: "block+",
  attrs: { width: { default: "50%" } },
};
```

### React Integration

The UI components communicate with ProseMirror via:

1. **Commands** - Trigger via `editor.runCommand()`
2. **State** - Read via `editor.getState()`
3. **Transactions** - Dispatch via `editor.dispatch(tr)`

### Performance Considerations

- **Lazy loading** - Only load block icons when palette opens
- **Debounced styles** - Style changes debounced at 100ms
- **Virtual scrolling** - For large block lists (>50 items)

---

## 10. Future Enhancements

### v2.0 Roadmap

- **Nested Sections** - Drag sections inside other sections
- **Responsive Styles** - Different styles for mobile/tablet/desktop
- **Theme Presets** - Pre-built color schemes
- **AI Generation** - Generate layouts from prompts

### Plugin System

```typescript
// Future: Third-party block plugins
editor.use(MyCustomPlugin);

// Plugin provides blocks, styles, and UI
const plugin = {
  name: "ecommerce",
  blocks: [ProductCard, Cart, Checkout],
  styles: ecommerceStyles,
};
```

---

## 11. Appendix

### A. CSS Variables for Theming

```css
:root {
  /* Spacing */
  --ark-padding-xs: 0.5rem;
  --ark-padding-sm: 1rem;
  --ark-padding-md: 2rem;
  --ark-padding-lg: 4rem;

  /* Colors */
  --ark-bg-primary: #ffffff;
  --ark-bg-secondary: #f9fafb;
  --ark-text-primary: #111827;
  --ark-text-secondary: #6b7280;

  /* Borders */
  --ark-radius-sm: 4px;
  --ark-radius-md: 8px;
  --ark-radius-lg: 16px;
  --ark-radius-full: 9999px;
}
```

### B. Default Block Icons

```typescript
const BlockIcons = {
  section: Square,
  columns: Columns2,
  heading: Heading1,
  text: Type,
  list: List,
  quote: Quote,
  code: Code2,
  image: Image,
  divider: Minus,
  hero: LayoutTemplate,
  features: Grid3x3,
  pricing: CreditCard,
  cta: Megaphone,
  testimonials: MessageSquareQuote,
};
```

### C. Error Handling

```typescript
// Invalid column operations
try {
  editor.runCommand("removeColumn", 5); // Out of bounds
} catch (e) {
  // Error: Column index out of range
}

// Invalid block registration
editor.registerBlock({ type: "section" }); // Already exists
// Warning: Block type "section" already registered
```

---

## 12. Glossary

| Term            | Definition                                   |
| --------------- | -------------------------------------------- |
| Block           | A content unit (section, paragraph, image)   |
| Block Registry  | Central system for managing available blocks |
| Column          | Single column in a multi-column layout       |
| Columns         | Container for multiple columns               |
| Section         | Primary container block                      |
| Style Inspector | Panel for editing block visual properties    |
| Quick Inserter  | "/" command popup for inserting blocks       |

---

_End of Specification_

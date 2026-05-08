# Arkpad Page Builder Specification - FULL GRAPESJS EXPERIENCE

A comprehensive specification for building a full-featured visual page builder rivaling GrapesJS, powered by Arkpad's ProseMirror core.

**Version:** 2.0 (Full GrapesJS Experience)  
**Status:** Draft for Discussion  
**Last Updated:** May 8, 2026

---

## 🎯 Vision: "GrapesJS, but with ProseMagic"

**Goal:** Create a page builder with the same visual freedom as GrapesJS, but powered by ProseMirror's structured content engine. Users can build ANY layout visually, with full drag-drop, style editing, and component library - while keeping semantic, structured content.

---

## 1. GrapesJS Feature Parity

### ✅ What's Already Implemented

| GrapesJS Feature                       | Arkpad Status         |
| -------------------------------------- | --------------------- |
| Block-based editing                    | ✅ Section + blocks   |
| Drag & drop from panel                 | ✅ Sidebar → editor   |
| Device preview (Desktop/Tablet/Mobile) | ✅ Working            |
| Text editing                           | ✅ ProseMirror        |
| Inline formatting                      | ✅ Bold, italic, etc. |

### 🚀 What's NEW (Going Beyond GrapesJS)

| Feature                | Description                      |
| ---------------------- | -------------------------------- |
| **AI Blocks**          | Generate sections with AI        |
| **Live Collaboration** | Real-time multi-user editing     |
| **Component Library**  | Pre-built, customizable sections |
| **Template Store**     | One-click page templates         |
| **Semantic Export**    | Clean HTML, not inline styles    |
| **Block API**          | Easy custom block registration   |

---

## 2. UI/UX Specification (Full GrapesJS Style)

### 2.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (40px)                                                 │
│  [Logo] [Device: D T M] [Preview] [Publish] [Save]     [Settings] │
├────────────┬────────────────────────────────────┬────────────────────┤
│ LEFT      │                                    │ RIGHT               │
│ PANEL     │        CANVAS                      │ PANEL              │
│ (260px)   │        (Flex)                       │ (280px)            │
│            │                                    │                    │
│ ┌────────┐ │  ┌────────────────────────────┐   │ ┌────────────────┐ │
│ │Blocks  │ │  │                            │   │ │ Style Manager  │ │
│ │        │ │  │      EDITOR AREA            │   │ │                │ │
│ │ [Sec]  │ │  │                            │   │ │ Background     │ │
│ │ [Col]  │ │  │      Drop Zone              │   │ │ Padding        │ │
│ │ [Img]  │ │  │                            │   │ │ Margin         │ │
│ │ ...    │ │  │                            │   │ │ Border         │ │
│ │        │ │  │                            │   │ │ Typography     │ │
│ ├────────┤ │  │                            │   │ │ Flex/Grid      │ │
│ │Layers  │ │  │                            │   │ │ Animation      │ │
│ │        │ │  │                            │   │ │ Custom CSS     │ │
│ │        │ │  └────────────────────────────┘   │ │                │ │
│ ├────────┤ │                                    │ └────────────────┘ │
│ │Pages   │ │                                    │                    │
│ │        │ │                                    │ ┌────────────────┐ │
│ └────────┘ │                                    │ │ Trait Manager  │ │
│            │                                    │ │ (Block props)  │ │
│            │                                    │ └────────────────┘ │
├────────────┴────────────────────────────────────┴────────────────────┤
│  BOTTOM BAR (24px)                                                  │
│  [Zoom: 100%] [Selection: p#abc] [Storage Status]                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Visual Details

#### Color Palette (GrapesJS-inspired)

```css
:root {
  /* Panel Backgrounds */
  --ark-panel-bg: #ffffff;
  --ark-panel-dark: #1e1e1e;
  --ark-panel-header: #2d2d2d;

  /* Accent Colors */
  --ark-primary: #5c6bc0;
  --ark-primary-light: #7986cb;
  --ark-accent: #42a5f5;
  --ark-success: #66bb6a;
  --ark-warning: #ffa726;
  --ark-danger: #ef5350;

  /* Text */
  --ark-text-main: #323232;
  --ark-text-muted: #777777;
  --ark-text-light: #eeeeee;

  /* Borders */
  --ark-border: #dbdbdb;
  --ark-border-light: #e8e8e8;

  /* Canvas */
  --ark-canvas-bg: #f5f5f5;
  --ark-canvas-pattern: rgba(0, 0, 0, 0.03);

  /* Selection */
  --ark-selection: rgba(92, 107, 192, 0.3);
  --ark-highlight: rgba(66, 165, 245, 0.4);
}
```

#### Typography

```css
/* Panel Typography */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
font-size: 13px;
line-height: 1.4;

/* Headers */
.panel-header {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #777;
}
```

#### Spacing System

```css
--ark-space-xs: 4px;
--ark-space-sm: 8px;
--ark-space-md: 12px;
--ark-space-lg: 16px;
--ark-space-xl: 24px;
```

---

## 3. Core Features Specification

### 3.1 Block Manager (Left Panel - Blocks Tab)

**Purpose:** Find and drag blocks into the canvas.

**Features:**

- **Search** - Filter blocks by name
- **Categories** - Collapsible groups
- **Drag Preview** - Ghost image while dragging
- **Quick Insert** - Double-click to insert at cursor

### 3.2 Layers Panel (Left Panel - Layers Tab)

**Purpose:** See document structure, reorder blocks.

**Features:**

- **Drag to reorder** - Reorder sections/columns
- **Show/Hide** - Toggle visibility
- **Lock/Unlock** - Prevent editing
- **Group/Ungroup** - Combine blocks

### 3.3 Style Manager (Right Panel)

**Purpose:** Visual style editor for selected element.

**Tabs:**

- **Dimensions** - Width, Height, Min, Max
- **Spacing** - Margin, Padding
- **Typography** - Font, Size, Weight, Align, Color
- **Background** - Color, Gradient, Image
- **Border** - Style, Width, Radius, Color
- **Flexbox** - Display, Direction, Justify, Align, Wrap
- **Extra** - Opacity, Custom CSS

### 3.4 Trait Manager (Right Panel - Below Style)

**Purpose:** Edit block-specific properties (not styles).

**Fields:**

- **General** - ID, Class, Title
- **Image** - Source, Alt, Width
- **Link** - URL, Target, Rel

### 3.5 Device Preview (Header)

**Purpose:** Preview on different devices.

- **Desktop** - 100% (container width)
- **Tablet** - 768px centered
- **Mobile** - 375px centered

### 3.6 Pages Panel (Left Panel - Pages Tab)

**Purpose:** Manage multiple pages in a site.

**Features:**

- Create/Delete pages
- Rename pages
- Thumbnail previews
- Import/Export

---

## 4. Drag & Drop System

### 4.1 Drop Zones

**Visual indicators showing where blocks will land:**

```css
/* Drop indicator line */
.ark-drop-indicator {
  height: 3px;
  background: var(--ark-primary);
  border-radius: 2px;
  position: absolute;
  animation: ark-drop-pulse 0.8s infinite;
}

/* Drop zone highlight */
.ark-drop-zone {
  outline: 2px dashed var(--ark-primary-light);
  background: rgba(92, 107, 192, 0.1);
}

/* Column drop target */
.ark-column-drop {
  min-height: 50px;
  border: 2px dashed var(--ark-border);
  transition: all 0.2s;
}

.ark-column-drop.ark-drag-over {
  border-color: var(--ark-primary);
  background: var(--ark-selection);
}
```

### 4.2 Drag Behavior

| Scenario           | Behavior                                 |
| ------------------ | ---------------------------------------- |
| Drag from sidebar  | Show ghost, cursor changes to "grabbing" |
| Hover over section | Show horizontal line between blocks      |
| Hover over column  | Column highlights, show insert position  |
| Drop on indicator  | Insert at position, animate in           |
| Drop on column     | Append to column content                 |

---

## 5. Component Library

### 5.1 Built-in Components

| Component        | Description         | Content                              |
| ---------------- | ------------------- | ------------------------------------ |
| **Hero**         | Main header section | Heading + subtext + CTA button       |
| **Features**     | 3-column icon grid  | 3 columns with icon + title + text   |
| **Pricing**      | Pricing table       | 3 cards with price, features, button |
| **Testimonials** | Customer quotes     | 2-3 quote blocks                     |
| **CTA**          | Call-to-action      | Heading + button + background        |
| **Stats**        | Number highlights   | 4 stats in a row                     |
| **Team**         | Team members        | Grid of profile cards                |
| **Gallery**      | Image grid          | Masonry or grid of images            |
| **Footer**       | Site footer         | Links, social, copyright             |
| **Contact**      | Contact form        | Form fields + info                   |

### 5.2 Component Customization

```typescript
// Customize on insert
editor.runCommand("insertComponent", "hero", {
  title: "Welcome to Our Site",
  subtitle: "We provide amazing services",
  buttonText: "Get Started",
  buttonUrl: "/get-started",
  backgroundColor: "#f9fafb",
});
```

---

## 6. Template Library

### 6.1 Pre-built Templates

| Template         | Description                              | Pages |
| ---------------- | ---------------------------------------- | ----- |
| **Landing Page** | Hero + Features + Pricing + CTA + Footer | 1     |
| **Blog Post**    | Header + Content + Sidebar + Footer      | 1     |
| **About Page**   | Hero + Team + Stats + Footer             | 1     |
| **Contact Page** | Form + Info + Map                        | 1     |
| **Pricing Page** | Hero + Pricing + FAQ + CTA               | 1     |
| **Portfolio**    | Gallery + About + Contact                | 1     |

---

## 7. Storage & Export

### 7.1 Auto-save

```typescript
const storageOptions = {
  local: true,
  remote: false,
  onSave: (data) => void,
  onLoad: () => data
};
```

### 7.2 Export Options

```typescript
// Export as HTML
const html = editor.getHtml();

// Export as JSON
const json = editor.getJson();

// Export with CSS
const { html, css } = editor.getHtmlWithCss();
```

---

## 8. API Reference

### 8.1 Block Registration

```typescript
editor.registerBlock({
  type: "myBlock",
  label: "My Custom Block",
  icon: MyIcon,
  category: "custom",
  create: (options) => ({
    type: "section",
    content: options?.content || [
      { type: "heading", content: "Title" },
      { type: "paragraph", content: "Description" },
    ],
  }),
  styleConfig: {
    backgroundColor: true,
    padding: true,
    borderRadius: true,
  },
});
```

### 8.2 Component Registration

```typescript
editor.registerComponent({
  type: "hero",
  label: "Hero Section",
  content: {
    type: "section",
    content: [
      { type: "heading", content: "Welcome" },
      { type: "paragraph", content: "Your subtext" },
    ],
  },
  variables: [
    { key: "title", label: "Title", type: "text", default: "Welcome" },
    { key: "bgColor", label: "Background", type: "color", default: "#f9fafb" },
  ],
});
```

---

## 9. Technical Implementation

### 9.1 File Structure

```
packages/
├── core/src/
│   ├── services/
│   │   ├── BlockRegistry.ts      (NEW)
│   │   ├── StyleManager.ts       (NEW)
│   │   ├── TemplateStore.ts      (NEW)
│   │   └── PagesManager.ts       (NEW)
│   └── extensions/
│       └── ux/
│           ├── DragDrop.ts       (UPDATE)
│           ├── BlockHandle.ts    (UPDATE)
│           ├── SelectionBox.ts   (NEW)
│           └── DropIndicator.ts  (NEW)
│
├── extension-columns/           (NEW)
│
├── extension-components/        (NEW)
│
└── react/src/components/
    └── Builder/
        ├── BlockPanel.tsx       (NEW)
        ├── StylePanel.tsx       (NEW)
        ├── LayersPanel.tsx      (NEW)
        ├── TraitsPanel.tsx      (NEW)
        ├── PagesPanel.tsx       (NEW)
        ├── TopBar.tsx           (UPDATE)
        ├── DevicePreview.tsx   (NEW)
        ├── ContextMenu.tsx      (NEW)
        └── QuickInsert.tsx       (NEW)
```

### 9.2 Performance Targets

| Operation        | Target  |
| ---------------- | ------- |
| Initial load     | < 500ms |
| Block drag start | < 50ms  |
| Style apply      | < 100ms |
| Template load    | < 1s    |

---

## 10. Summary: GrapesJS vs Arkpad

| Feature            | GrapesJS       | Arkpad Page Builder |
| ------------------ | -------------- | ------------------- |
| **Content Model**  | HTML fragments | ProseMirror Schema  |
| **Data Structure** | Flat JSON      | Structured tree     |
| **Text Editing**   | Rich text      | Full ProseMirror    |
| **Export**         | Inline styles  | Semantic HTML       |
| **Blocks**         | Static         | Registry-based      |
| **Components**     | Limited        | Full API            |
| **Templates**      | Basic          | Full page           |
| **AI**             | ❌             | ✅ (future)         |
| **Collaboration**  | ❌             | ✅ (future)         |
| **Custom Blocks**  | Complex        | Simple API          |

---

## 11. Implementation Phases

### Phase 1: Core Infrastructure

- BlockRegistry service (🏗️)
- Column nodes (🏗️)
- DragDrop with indicators (✅)
- Section node (✅)

### Phase 2: UI Components

- BlockPanel sidebar (✅)
- LayersPanel (🏗️)
- Drag-drop integration (✅)

### Phase 3: Style System

- StyleManager panel
- All style controls

### Phase 4: Components

- All built-in components
- Template library

### Phase 5: Polish

- Context menus
- Keyboard shortcuts
- Export/Import
- Performance tuning

---

_End of Full GrapesJS Specification_

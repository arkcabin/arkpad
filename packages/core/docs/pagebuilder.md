# Page Builder: Hybrid Architecture Guide

This document explains the **Page Builder** system built on top of Arkpad Core. It uses a hybrid architecture: **Zustand** for page structure (JSON array of components) and **ArkpadEditor (ProseMirror)** for rich text inside blocks. This approach gives you the flexibility of Puck JS with the power of ProseMirror.

---

## 1. Philosophy: Why Hybrid?

A page builder needs two very different things:

| Concern                                                   | Tool                       | Why                                                                                     |
| --------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------- |
| **Page layout** (component tree, ordering, props)         | Zustand + plain JSON       | Flexible — any component shape, dynamic registration, easy DnD, full JSON serialization |
| **Rich text** (bold, italic, links, lists inside a block) | ArkpadEditor (ProseMirror) | Best-in-class rich text editing, battle-tested, extensible                              |

**Pure ProseMirror** would require every custom component to register a PM Node + NodeView — rigid and complex.  
**Pure Zustand** would lack rich text capabilities.

The hybrid gives you both: layout flexibility + ProseMirror richness.

---

## 2. Data Model (`PageData`)

The entire page is a plain JSON object managed by Zustand:

```typescript
type PageData = {
  content: ComponentInstance[];
  root: { props: Record<string, any> };
};

type ComponentInstance = {
  id: string; // auto-generated nanoid
  type: string; // matches config.components key
  props: Record<string, any>; // field values (user-editable)
};
```

### Example

```json
{
  "content": [
    {
      "id": "abc123",
      "type": "HeadingBlock",
      "props": { "text": "Welcome", "level": "h2" }
    },
    {
      "id": "def456",
      "type": "RichTextBlock",
      "props": {
        "content": {
          "type": "doc",
          "content": [
            { "type": "paragraph", "content": [{ "type": "text", "text": "Hello world" }] }
          ]
        }
      }
    },
    {
      "id": "ghi789",
      "type": "HeroBlock",
      "props": { "title": "Hero", "backgroundImage": "/bg.jpg" }
    }
  ],
  "root": { "props": {} }
}
```

**Key rule:** Only `type` + `props` are stored. The `id` is auto-generated. No functions, no classes, no React elements — fully JSON serializable.

---

## 3. Component Config (`PageConfig`)

Users define available components in a plain config object:

```typescript
type PageConfig = {
  components: Record<string, ComponentDefinition>;
};

type ComponentDefinition<Props = any> = {
  label: string;
  category: "layout" | "typography" | "media" | "custom";
  icon?: ReactNode;
  defaultProps: Props;
  fields: Record<string, FieldDefinition>;
  render: (props: Props) => ReactNode;
};
```

### Built-in Components Example

```typescript
const config: PageConfig = {
  components: {
    HeadingBlock: {
      label: "Heading",
      category: "typography",
      defaultProps: { text: "New Heading", level: "h2" },
      fields: {
        text: { type: "text", label: "Content" },
        level: { type: "select", label: "Level", options: ["h1", "h2", "h3"] },
      },
      render: ({ text, level }) => {
        const Tag = level || "h2"
        return <Tag>{text}</Tag>
      },
    },

    RichTextBlock: {
      label: "Rich Text",
      category: "typography",
      defaultProps: { content: { type: "doc", content: [{ type: "paragraph" }] } },
      fields: {
        content: { type: "richtext", label: "Content" },
      },
      render: ({ content }) => {
        return <RichTextRenderer content={content} />
      },
    },

    ImageBlock: {
      label: "Image",
      category: "media",
      defaultProps: { src: "", alt: "", caption: "" },
      fields: {
        src: { type: "image", label: "Image URL" },
        alt: { type: "text", label: "Alt text" },
        caption: { type: "text", label: "Caption" },
      },
      render: ({ src, alt, caption }) => (
        <figure>
          <img src={src} alt={alt} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      ),
    },
  },
}
```

### Third-Party Custom Component

```typescript
// @arkpad/component-hero
import type { ComponentDefinition } from "@arkpad/page-builder"

export const HeroBlock: ComponentDefinition = {
  label: "Hero Section",
  category: "layout",
  defaultProps: { title: "Welcome", subtitle: "", ctaText: "Get Started" },
  fields: {
    title: { type: "text", label: "Title" },
    subtitle: { type: "text", label: "Subtitle" },
    backgroundImage: { type: "image", label: "Background Image" },
    ctaText: { type: "text", label: "Button Text" },
  },
  render: ({ title, subtitle, backgroundImage, ctaText }) => (
    <section className="hero" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <button>{ctaText}</button>
    </section>
  ),
}
```

### Plugging In

```tsx
import { HeadingBlock, RichTextBlock, ImageBlock } from "@arkpad/components"
import { HeroBlock } from "@arkpad/component-hero"
import { PageBuilder } from "@arkpad/page-builder"

const config = {
  components: {
    HeadingBlock,      // built-in
    RichTextBlock,     // built-in
    ImageBlock,        // built-in
    HeroBlock,         // ← third-party, just imported and added
  },
}

<PageBuilder config={config} data={initialData} onPublish={saveToDB} />
```

**No schema changes, no registration API, no ProseMirror node types.** Just import + add to config.

---

## 4. Field System

Every field type defines how a prop is edited in the PropsPanel:

```typescript
type FieldDefinition =
  | { type: "text"; label: string; placeholder?: string }
  | { type: "textarea"; label: string }
  | { type: "number"; label: string; min?: number; max?: number }
  | { type: "select"; label: string; options: { label: string; value: string }[] }
  | { type: "radio"; label: string; options: { label: string; value: string }[] }
  | { type: "boolean"; label: string }
  | { type: "color"; label: string }
  | { type: "image"; label: string }
  | { type: "richtext"; label: string };
```

### The `richtext` Field (ProseMirror Integration)

This is the key field that bridges Zustand and ProseMirror:

```tsx
function RichTextField({ value, onChange }) {
  const editor = useArkpadEditor({
    content: value,
    extensions: [StarterKit],
    onUpdate: ({ editor }) => {
      // On every change, serialize PM state to JSON → store in Zustand props
      onChange(editor.getJSON());
    },
  });

  return <ArkpadEditorContent editor={editor} />;
}
```

**Data flow:**

```
User types in block
  → ProseMirror transaction
  → onUpdate callback
  → editor.getJSON() → serialize to JSON
  → store.updateProps(id, { content: json })
  → Zustand updates, only this block re-renders
  → On save: JSON.stringify(pageData) → DB
```

The full page JSON contains ProseMirror JSON nested inside the `content` prop of rich text blocks — a single serializable document.

---

## 5. Zustand Store API

```typescript
interface PageStore {
  // Data
  data: PageData;

  // Actions
  addComponent: (type: string, index?: number, zone?: string) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, toIndex: number) => void;
  duplicateComponent: (id: string) => void;
  updateProps: (id: string, props: Record<string, any>) => void;
  setData: (data: PageData) => void;
  reset: () => void;

  // Serialization
  getPageJSON: () => PageData;

  // Selectors
  useComponent: (id: string) => ComponentInstance | undefined;
  useComponentAt: (index: number) => ComponentInstance | undefined;
  useContentLength: () => number;
}
```

### addComponent Flow

```
User drags "HeadingBlock" from palette to position 2

1. store.addComponent("HeadingBlock", 2)

2. Internally:
   const defaults = config.components["HeadingBlock"].defaultProps
   const newItem = {
     id: nanoid(),
     type: "HeadingBlock",
     props: { ...defaults },
   }

3. data.content.splice(2, 0, newItem)

4. Pure JSON → only subscribers to content[2] re-render
```

### updateProps Flow

```
User changes "title" field in PropsPanel

1. store.updateProps("abc123", { title: "New Title" })

2. Internally:
   const item = data.content.find(i => i.id === "abc123")
   item.props = { ...item.props, ...partialProps }

3. Only the component rendering "abc123" re-renders
   (Zustand selector with shallow equality)
```

### Why Zustand over Context/Redux

|                     | Zustand                            | Context + useReducer                     |
| ------------------- | ---------------------------------- | ---------------------------------------- |
| **Re-renders**      | Selective — only subscribed slices | ALL consumers re-render                  |
| **Boilerplate**     | ~50 lines for full CRUD            | Actions + reducers + provider + dispatch |
| **DevTools**        | Built-in (devtools middleware)     | Manual                                   |
| **Selectors**       | `store.useComponent(id)` pattern   | `useContext` has no selectors            |
| **External access** | `store.getState()` anywhere        | Need React tree                          |

---

## 6. Rendering Pipeline

### Production Render (`<RenderPage>`)

```tsx
function RenderPage({ config, data }) {
  return (
    <div className="page">
      {data.content.map((item) => {
        const componentDef = config.components[item.type];
        if (!componentDef) return null;
        return <componentDef.render key={item.id} {...item.props} />;
      })}
    </div>
  );
}
```

### Visual Editor (`<PageBuilder>`)

```tsx
function PageBuilder({ config, data, onPublish }) {
  return (
    <div className="page-builder">
      <Palette config={config} /> {/* draggable component list */}
      <Canvas config={config} /> {/* drop zone with DnD + selection */}
      <PropsPanel config={config} /> {/* field editors for selected block */}
    </div>
  );
}
```

The Canvas component:

- Renders each component via its `render` function
- Wraps each in a `BlockWrapper` (selection border, drag handle, delete/duplicate buttons)
- Handles DnD reordering via `@dnd-kit`
- Shows a drop indicator during drag

---

## 7. Adding a Component — Full Flow

```
1. User sees Palette sidebar
   → Palette reads config.components keys
   → Renders each as a draggable item grouped by category

2. User drags "HeroBlock" from palette to position 3 on canvas

3. @dnd-kit fires onDragEnd:
   → store.addComponent("HeroBlock", 3)

4. Store creates:
   {
     id: "hero_x1k2",
     type: "HeroBlock",
     props: { title: "Welcome", subtitle: "", ctaText: "Get Started", backgroundImage: "" }
   }

5. Canvas re-renders:
   → Finds componentDef = config.components["HeroBlock"]
   → Calls componentDef.render({ title, subtitle, ctaText, backgroundImage })
   → Wraps result in BlockWrapper (selection, drag handle)

6. User clicks the block → selected
   → PropsPanel shows fields from HeroBlock.fields
   → User edits "title" → store.updateProps("hero_x1k2", { title: "Big Hero" })
   → Only this block re-renders

7. User clicks Publish
   → onPublish(store.getPageJSON())
   → Save to DB
```

---

## 8. DnD Integration (`@dnd-kit`)

```tsx
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";

// Canvas
function Canvas({ config }) {
  const items = usePageStore((s) => s.data.content);
  const moveComponent = usePageStore((s) => s.moveComponent);

  return (
    <DndContext onDragEnd={(event) => moveComponent(event.active.id, event.over?.id)}>
      <SortableContext items={items.map((i) => i.id)}>
        {items.map((item) => (
          <SortableBlock key={item.id} config={config} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  );
}

// Each block is a sortable item
function SortableBlock({ config, item }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const Component = config.components[item.type]?.render;

  return (
    <div ref={setNodeRef} style={{ transform, transition }}>
      <DragHandle {...attributes} {...listeners} /> {/* grab handle */}
      <Component {...item.props} />
    </div>
  );
}
```

---

## 9. Key Design Decisions

### Why not full ProseMirror?

| Capability                 | Pure ProseMirror                  | Hybrid (PM only for richtext)      |
| -------------------------- | --------------------------------- | ---------------------------------- |
| **Add custom component**   | Register PM node + write NodeView | Just add to `config.components`    |
| **Dynamic schema**         | Recompile schema on every change  | No schema — just config keys       |
| **JSON serialization**     | PM node tree (deep, complex)      | Flat array of `{ type, props }`    |
| **Third-party components** | Must publish PM extension         | Must publish plain React component |
| **DnD reorder**            | Complex (move PM node in doc)     | Simple (array splice in Zustand)   |

### Why Zustand over Context?

- **Selective re-renders** — `useStore((s) => s.data.content[2])` only re-renders when that specific component changes. Context re-renders ALL consumers.
- **DevTools** — Zustand devtools gives time-travel debugging out of the box.
- **External access** — `pageStore.getState()` works outside React (sagas, timers, WebSocket listeners).

### Why plain JSON over PM doc for page structure?

A page builder component tree is fundamentally different from a rich text document:

- Components have arbitrary props (image src, video URL, button color)
- Components can be nested in arbitrary ways (columns within sections)
- Components come from third parties with no PM schema

Trying to force this into a ProseMirror document tree fights the tool. Instead, we use ProseMirror only where it excels: rich text editing within blocks.

---

## 10. Package Structure

```
@arkpad/page-builder           ← Core engine (Zustand store, renderer, editor, field types)
  └── dependencies: @arkpad/core, @arkpad/react, zustand, @dnd-kit

@arkpad/components             ← Optional built-in blocks (Heading, RichText, Image, Button, Divider)
  └── dependencies: @arkpad/page-builder (types only)

@arkpad/component-hero         ← Third-party component (published on npm)
  └── dependencies: @arkpad/page-builder (types only), react

any-user-published-package     ← Anyone can publish their own blocks
  └── dependencies: @arkpad/page-builder (types only)
```

Example `package.json` for a third-party component:

```jsonc
{
  "name": "@arkpad/component-hero",
  "version": "1.0.0",
  "main": "dist/index.js",
  "peerDependencies": {
    "@arkpad/page-builder": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
  },
}
```

---

## Summary

```
User components     → config.components (plain object, no schema)
Page data           → Zustand JSON array (content: ComponentInstance[])
Rich text           → ArkpadEditor (ProseMirror JSON inside "richtext" field props)
Rendering           → config.components[type].render(props)
DnD                 → @dnd-kit (sortable array)
Serialization       → JSON.stringify(pageStore.getPageJSON())
Third-party         → import + add to config.components — that's it
Model inspiration   → Puck JS (data.content[] + config.components pattern)
Editor engine       → Arkpad Core
```

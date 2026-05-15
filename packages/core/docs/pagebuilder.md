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
  styles?: Record<string, any>; // Figma-like style properties (padding, margin, bgColor, etc.)
};
```

### Example

```json
{
  "content": [
    {
      "id": "abc123",
      "type": "HeadingBlock",
      "props": { "text": "Welcome", "level": "h2" },
      "styles": { "padding": "16px", "backgroundColor": "#f5f5f5", "textAlign": "center" }
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
  styleConfig?: StyleConfig; // which style controls to show in the StylePanel (like Figma)
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

## 5. Style System (Figma-like Design Panel)

Every block has a universal `styles` prop that controls its visual appearance — like Figma's right-side design panel. The `styleConfig` on the component definition controls which style controls are shown.

### StyleConfig

```typescript
type StyleConfig = {
  // Dimensions
  width?: boolean;
  height?: boolean;
  minHeight?: boolean;

  // Spacing
  padding?: boolean | { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };
  margin?: boolean | { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };

  // Typography (for text-containing blocks)
  textAlign?: boolean;
  fontSize?: boolean;
  fontWeight?: boolean;
  lineHeight?: boolean;
  color?: boolean;

  // Background
  backgroundColor?: boolean;
  backgroundImage?: boolean;

  // Border
  border?: boolean | { width?: boolean; color?: boolean; style?: boolean };
  borderRadius?: boolean;

  // Effects
  boxShadow?: boolean;
  opacity?: boolean;

  // Transform
  rotate?: boolean;
  scale?: boolean;
};
```

### How It Works

Each `ComponentInstance` can optionally have a `styles` object:

```json
{
  "id": "abc123",
  "type": "HeadingBlock",
  "props": { "text": "Welcome", "level": "h2" },
  "styles": {
    "paddingTop": "16px",
    "paddingRight": "24px",
    "paddingBottom": "16px",
    "paddingLeft": "24px",
    "backgroundColor": "#1a1a2e",
    "color": "#ffffff",
    "textAlign": "center",
    "borderRadius": "8px",
    "boxShadow": "0 4px 6px rgba(0,0,0,0.1)"
  }
}
```

### Component Example with styleConfig

```tsx
const config = {
  components: {
    HeadingBlock: {
      label: "Heading",
      category: "typography",
      defaultProps: { text: "New Heading", level: "h2" },
      styleConfig: {
        padding: true, // all sides
        margin: true,
        backgroundColor: true,
        textAlign: true,
        color: true,
        fontSize: true,
        borderRadius: true,
        border: true,
      },
      fields: {
        text: { type: "text", label: "Content" },
        level: { type: "select", label: "Level", options: ["h1", "h2", "h3"] },
      },
      render: ({ text, level, styles }) => {
        const Tag = level || "h2";
        return <Tag style={styles}>{text}</Tag>;
      },
    },

    ImageBlock: {
      label: "Image",
      category: "media",
      defaultProps: { src: "", alt: "" },
      styleConfig: {
        width: true,
        height: true,
        borderRadius: true,
        border: true,
        boxShadow: true,
        opacity: true,
      },
      fields: {
        src: { type: "image", label: "Image URL" },
        alt: { type: "text", label: "Alt text" },
      },
      render: ({ src, alt, styles }) => <img src={src} alt={alt} style={styles} />,
    },
  },
};
```

### StylePanel Component

The `<StylePanel>` reads `styleConfig` from the selected block's definition and renders the appropriate controls:

```tsx
function StylePanel({ componentDef, selectedId, styles, onUpdateStyles }) {
  const config = componentDef.styleConfig;
  if (!config) return null;

  return (
    <div className="style-panel">
      {config.padding && (
        <Section label="Padding">
          <Grid4>
            <Field label="T">
              <NumberInput
                value={styles.paddingTop}
                onChange={(v) => onUpdateStyles(selectedId, { paddingTop: v + "px" })}
              />
            </Field>
            <Field label="R">
              <NumberInput
                value={styles.paddingRight}
                onChange={(v) => onUpdateStyles(selectedId, { paddingRight: v + "px" })}
              />
            </Field>
            <Field label="B">
              <NumberInput
                value={styles.paddingBottom}
                onChange={(v) => onUpdateStyles(selectedId, { paddingBottom: v + "px" })}
              />
            </Field>
            <Field label="L">
              <NumberInput
                value={styles.paddingLeft}
                onChange={(v) => onUpdateStyles(selectedId, { paddingLeft: v + "px" })}
              />
            </Field>
          </Grid4>
        </Section>
      )}

      {config.backgroundColor && (
        <Section label="Background">
          <ColorInput
            value={styles.backgroundColor}
            onChange={(v) => onUpdateStyles(selectedId, { backgroundColor: v })}
          />
        </Section>
      )}

      {config.borderRadius && (
        <Section label="Border Radius">
          <NumberInput
            value={styles.borderRadius}
            onChange={(v) => onUpdateStyles(selectedId, { borderRadius: v + "px" })}
          />
        </Section>
      )}

      {config.boxShadow && (
        <Section label="Shadow">
          <Select
            value={styles.boxShadow}
            options={[
              { label: "None", value: "" },
              { label: "Small", value: "0 2px 4px rgba(0,0,0,0.1)" },
              { label: "Medium", value: "0 4px 6px rgba(0,0,0,0.1)" },
              { label: "Large", value: "0 10px 20px rgba(0,0,0,0.15)" },
            ]}
            onChange={(v) => onUpdateStyles(selectedId, { boxShadow: v })}
          />
        </Section>
      )}

      {config.opacity && (
        <Section label="Opacity">
          <Slider
            min={0}
            max={1}
            step={0.1}
            value={styles.opacity ?? 1}
            onChange={(v) => onUpdateStyles(selectedId, { opacity: v })}
          />
        </Section>
      )}

      {/* ... more style controls ... */}
    </div>
  );
}
```

### Rendering Styles

During render, styles are applied as inline CSS:

```tsx
function BlockRenderer({ config, item }) {
  const componentDef = config.components[item.type];
  if (!componentDef) return null;

  // Merge styles into the component's render props
  const mergedProps = {
    ...item.props,
    styles: item.styles || {},
  };

  return <componentDef.render key={item.id} {...mergedProps} />;
}
```

The block's `render` function receives `styles` and applies it via `style={styles}` on its root element. This keeps the style system universal — every block gets Figma-like design controls regardless of what the block renders.

---

## 6. Zustand Store API

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
  updateStyles: (id: string, styles: Record<string, any>) => void;
  setData: (data: PageData) => void;
  reset: () => void;

  // Serialization
  getPageJSON: () => PageData;

  // Selectors
  useComponent: (id: string) => ComponentInstance | undefined;
  useComponentAt: (index: number) => ComponentInstance | undefined;
  useContentLength: () => number;
  useStyles: (id: string) => Record<string, any> | undefined;
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
     styles: {},  // empty styles — user fills in via StylePanel
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

### updateStyles Flow

```
User changes padding in StylePanel

1. store.updateStyles("abc123", { paddingTop: "16px", paddingBottom: "16px" })

2. Internally:
   const item = data.content.find(i => i.id === "abc123")
   item.styles = { ...item.styles, ...partialStyles }

3. Only "abc123" re-renders with new inline styles applied
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

## 7. Rendering Pipeline

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
  const selectedId = useSelectedId();

  return (
    <div className="page-builder">
      <Palette config={config} /> {/* draggable component list */}
      <Canvas config={config} /> {/* drop zone with DnD + selection */}
      <div className="right-panel">
        <PropsPanel config={config} /> {/* content fields for selected block */}
        <StylePanel config={config} /> {/* Figma-like style controls for selected block */}
      </div>
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

## 8. Adding a Component — Full Flow

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

7. User opens StylePanel → StyleConfig shows enabled controls
   → User adds padding, changes background color, sets text alignment
   → store.updateStyles("hero_x1k2", { padding: "24px", backgroundColor: "#1a1a2e", textAlign: "center" })
   → Only this block re-renders with new inline styles

8. User clicks Publish
   → onPublish(store.getPageJSON())
   → DB saves full JSON including both props + styles
```

---

## 9. DnD Integration (`@dnd-kit`)

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

## 10. Tailwind CSS Support

StyleConfig can output **either inline CSS or Tailwind classes** — the render function decides:

### Option 1: Inline Styles (Default)

```tsx
HeadingBlock: {
  render: ({ text, level, styles }) => {
    const Tag = level || "h2"
    return <Tag style={styles}>{text}</Tag>
  },
}
// styles = { padding: "16px", backgroundColor: "#1a1a2e" }
// → <h2 style="padding:16px;background-color:#1a1a2e">Hello</h2>
```

### Option 2: Tailwind Classes

The component's `render` function maps styles to Tailwind classes:

```tsx
HeadingBlock: {
  render: ({ text, level, styles }) => {
    const Tag = level || "h2"
    const classes = cx(
      styles.padding && `p-${styles.padding}`,     // "p-4"
      styles.backgroundColor === "#1a1a2e" && "bg-[#1a1a2e]",
      styles.textAlign === "center" && "text-center",
    )
    return <Tag className={classes}>{text}</Tag>
  },
}
```

### Option 3: Auto-generate Tailwind from StyleConfig

A built-in utility maps style values to Tailwind classes automatically:

```tsx
import { stylesToTailwind } from "@arkpad/page-builder"

HeadingBlock: {
  render: ({ text, level, styles }) => {
    const Tag = level || "h2"
    return <Tag className={stylesToTailwind(styles)}>{text}</Tag>
  },
}
// styles = { padding: { top: 4, right: 6, bottom: 4, left: 6 } }
// → "pt-4 pr-6 pb-4 pl-6"
// styles = { backgroundColor: "#1a1a2e" }
// → "bg-[#1a1a2e]"
```

**Key:** The page builder stores pure JSON (`styles` object). The render function decides how to apply it — inline CSS or Tailwind. Same JSON, different output styles.

---

## 11. Dynamic Data & API Binding

Components can fetch data from APIs at runtime. This makes the page builder a **real dynamic data system** — not just static content.

### The Data Model

Each component can optionally declare a `dataSource`:

```typescript
type ComponentInstance = {
  id: string;
  type: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
  dataSource?: DataSourceConfig; // ← NEW: API binding
};

type DataSourceConfig = {
  type: "static" | "api" | "context";
  // For API data
  url?: string; // e.g. "/api/products"
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: any;
  refreshInterval?: number; // auto-refresh in ms
  // For mapping API response to props
  mapping?: Record<string, string>; // { "title": "data.name", "image": "data.thumbnail" }
};
```

### How It Works at Render Time

```tsx
function BlockRenderer({ config, item }) {
  const componentDef = config.components[item.type];

  // If block has an API data source, fetch + merge
  const apiData = useDataSource(item.dataSource);
  // apiData = { title: "Product 1", image: "/img/1.jpg" }

  const mergedProps = {
    ...item.props,
    ...apiData, // API data overrides default props
    styles: item.styles,
  };

  return <componentDef.render {...mergedProps} />;
}
```

### Data Source Hook

```tsx
function useDataSource(dataSource: DataSourceConfig | undefined) {
  const [data, setData] = useState({});

  useEffect(() => {
    if (!dataSource || dataSource.type !== "api") return;

    const fetchData = async () => {
      const res = await fetch(dataSource.url, {
        method: dataSource.method || "GET",
        headers: dataSource.headers,
        body: dataSource.body ? JSON.stringify(dataSource.body) : undefined,
      });
      const json = await res.json();
      // Apply mapping: { "title": "data.name" } → { title: json.data.name }
      const mapped = mapData(json, dataSource.mapping);
      setData(mapped);
    };

    fetchData();

    // Auto-refresh
    if (dataSource.refreshInterval) {
      const interval = setInterval(fetchData, dataSource.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [dataSource]);

  return data;
}
```

### Example: Product List Block

```tsx
const ProductListBlock: ComponentDefinition = {
  label: "Product List",
  category: "components",
  defaultProps: { title: "Products" },
  fields: {
    title: { type: "text", label: "Title" },
    // Data source fields appear in a "Data" section of the panel
    apiUrl: { type: "text", label: "API URL", dataSource: true },
    mapping: { type: "mapping", label: "Field Mapping", dataSource: true },
  },
  render: ({ title, products }) => (
    <div>
      <h2>{title}</h2>
      <div className="grid">
        {products?.map((p) => (
          <div key={p.id}>
            <img src={p.image} />
            <h3>{p.name}</h3>
            <p>{p.price}</p>
          </div>
        ))}
      </div>
    </div>
  ),
};
```

### Data Flow

```
User adds "ProductList" block
  → Stores in Zustand: { type: "ProductList", props: { title: "Products" } }

User configures API in PropsPanel
  → Sets apiUrl: "/api/products"
  → Sets mapping: { "products": "data.items" }

At render time:
  → useDataSource("/api/products") → fetches
  → Maps response.data.items → products
  → Merges into props: { title: "Products", products: [...] }
  → componentDef.render({ title: "Products", products: [...] })
  → Renders the list

On save:
  → JSON stores: { type: "ProductList", props: { title: "Products", apiUrl: "/api/products", mapping: {...} } }
  → No data cached in JSON — fetched live at render time
```

### Builder UI For Data Binding

The PropsPanel shows a **"Data" tab** when a component has data source fields:

```
PropsPanel
  ├── Content Tab    ← props edit karo
  ├── Style Tab      ← Figma-like style panel
  └── Data Tab       ← API binding
        ├── Source: [API | Static | Context]
        ├── URL: /api/products
        ├── Method: GET
        ├── Mapping:
        │   title → data.name
        │   image → data.thumbnail
        └── [Test Fetch] button
```

### What This Makes Possible

| Feature               | How                                                 |
| --------------------- | --------------------------------------------------- |
| Fetch from CMS API    | Component binds to `/api/cms/pages`                 |
| Fetch from e-commerce | Product grid binds to `/api/products`               |
| User adds custom API  | Any REST endpoint, any mapping                      |
| Auto-refresh          | Dashboard with live data updates                    |
| Static override       | Props override API data when user manually edits    |
| SSR/SSG               | Data fetched at build time too (Next.js compatible) |

**This makes the page builder a full dynamic data system** — not just drag-drop UI but actual data-driven pages like Webflow or Builder.io.

---

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

## 12. Responsive Design — Per-Breakpoint Editing

For a full site builder, every style must work per breakpoint (desktop, tablet, mobile) — like Webflow.

### Breakpoint Data Model

```typescript
type Breakpoint = "desktop" | "tablet" | "mobile";

type ComponentInstance = {
  id: string;
  type: string;
  props: Record<string, any>;
  styles?: Record<string, any>;
  stylesByBreakpoint?: {
    desktop?: Record<string, any>;
    tablet?: Record<string, any>;
    mobile?: Record<string, any>;
  };
};
```

### Store Actions

```typescript
interface PageStore {
  // ... existing actions
  currentBreakpoint: Breakpoint;

  setBreakpoint: (bp: Breakpoint) => void;
  updateStyles: (id: string, styles: Record<string, any>, breakpoint?: Breakpoint) => void;
  // If no breakpoint given, applies to current breakpoint
}
```

### How It Works

```tsx
function StylePanel({ selectedId, componentDef, currentBreakpoint }) {
  const styles = useStyles(selectedId, currentBreakpoint);
  const updateStyles = usePageStore((s) => s.updateStyles);
  const setBreakpoint = usePageStore((s) => s.setBreakpoint);

  return (
    <div>
      {/* Breakpoint switcher */}
      <div className="breakpoints">
        <button onClick={() => setBreakpoint("desktop")}>🖥</button>
        <button onClick={() => setBreakpoint("tablet")}>📱</button>
        <button onClick={() => setBreakpoint("mobile")}>📲</button>
      </div>

      {/* Style controls — same Figma-like panel, but data goes to correct breakpoint */}
      <PaddingControl
        value={styles.padding}
        onChange={(v) => updateStyles(selectedId, { padding: v })}
      />
      <BackgroundControl
        value={styles.backgroundColor}
        onChange={(v) => updateStyles(selectedId, { backgroundColor: v })}
      />
    </div>
  );
}
```

### Render-Time Merging

```tsx
function BlockRenderer({ config, item, breakpoint }) {
  const desktopStyles = item.stylesByBreakpoint?.desktop || {};
  const tabletStyles = item.stylesByBreakpoint?.tablet || {};
  const mobileStyles = item.stylesByBreakpoint?.mobile || {};

  return (
    <componentDef.render
      {...item.props}
      styles={{
        ...desktopStyles, // base
        ...tabletStyles, // override for tablet
        ...mobileStyles, // override for mobile
      }}
    />
  );
}
```

Applied via CSS media queries or a runtime breakpoint observer.

---

## 13. Design System & Global Theme

A proper site builder needs a central design system — colors, fonts, spacing — that all blocks inherit.

### Theme Data Model

```typescript
type Theme = {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    // ... user-defined
  };
  typography: {
    fonts: {
      heading: string; // font family
      body: string;
    };
    sizes: {
      h1: string;
      h2: string;
      h3: string;
      body: string;
      small: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: string;
  boxShadow: string;
};

type PageData = {
  content: ComponentInstance[];
  root: { props: Record<string, any> };
  theme: Theme; // ← global design system
};
```

### How Blocks Use It

```tsx
function BlockRenderer({ config, item, theme }) {
  return (
    <componentDef.render
      {...item.props}
      styles={item.styles}
      theme={theme} // ← every block gets the design system
    />
  );
}
```

### Theme Editor UI

```
Design System Panel
  ├── Colors
  │   ├── Primary:    [#picker]
  │   ├── Secondary:  [#picker]
  │   ├── Background: [#picker]
  │   └── Text:       [#picker]
  ├── Typography
  │   ├── Heading Font: [select: Inter, Roboto, ...]
  │   ├── Body Font:    [select: Inter, Roboto, ...]
  │   └── Base Size:    [16px]
  └── Spacing
      ├── Container Width: [1200px]
      └── Gap:             [24px]
```

---

## 14. Pages & Navigation

### Multi-Page Model

```typescript
type SiteData = {
  pages: {
    [slug: string]: PageData; // home, about, blog, pricing, etc.
  };
  navigation: {
    primary: NavItem[]; // header menu
    footer: NavItem[]; // footer links
  };
  theme: Theme;
  globalComponents: {
    header?: ComponentInstance[];
    footer?: ComponentInstance[];
  };
};

type NavItem = {
  label: string;
  link: string;
  children?: NavItem[];
};
```

### Page Settings

Each page has SEO settings:

```typescript
type PageSettings = {
  slug: string;
  title: string; // <title>
  metaDescription: string;
  ogImage?: string;
  ogTitle?: string;
  canonical?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
};
```

### Router Integration

```tsx
// In Next.js / React Router
function SiteRenderer({ siteData }) {
  return (
    <Routes>
      {Object.entries(siteData.pages).map(([slug, pageData]) => (
        <Route
          key={slug}
          path={slug === "home" ? "/" : `/${slug}`}
          element={
            <>
              <Helmet>
                <title>{pageData.settings.title}</title>
                <meta name="description" content={pageData.settings.metaDescription} />
                <meta property="og:image" content={pageData.settings.ogImage} />
              </Helmet>
              {siteData.globalComponents.header && (
                <RenderPage config={config} data={{ content: siteData.globalComponents.header }} />
              )}
              <RenderPage config={config} data={pageData} />
              {siteData.globalComponents.footer && (
                <RenderPage config={config} data={{ content: siteData.globalComponents.footer }} />
              )}
            </>
          }
        />
      ))}
    </Routes>
  );
}
```

---

## 15. Complete SAAS Site Builder — Feature Matrix

### Legend

| Icon | Meaning                                       |
| ---- | --------------------------------------------- |
| ✅   | Built-in (arkpad core or covered in this doc) |
| ⚠️   | Partial — exists but needs more               |
| ⬜   | Need to build                                 |

### Editor

| Feature                  | Status | Notes                              |
| ------------------------ | ------ | ---------------------------------- |
| Drag-drop editor         | ✅     | @dnd-kit + Canvas                  |
| Component system         | ✅     | config.components                  |
| Custom React components  | ✅     | Just add to config                 |
| Block palette            | ✅     | Palette component                  |
| Inline editing           | ✅     | Richtext via ProseMirror           |
| Props panel              | ✅     | Auto-generated from fields         |
| Style panel (Figma-like) | ✅     | Section 5 of this doc              |
| Responsive breakpoints   | ⬜     | Section 12 — per-breakpoint styles |
| History / undo-redo      | ⬜     | Zustand temporal or custom         |
| Keyboard shortcuts       | ⬜     | copy/paste, delete, duplicate      |

### Design System

| Feature                      | Status | Notes                |
| ---------------------------- | ------ | -------------------- |
| Global theme (colors, fonts) | ⬜     | Section 13           |
| Typography management        | ⬜     | Font picker, sizes   |
| Spacing scale                | ⬜     | xs/sm/md/lg/xl       |
| Dark/light mode              | ⬜     | Theme toggle         |
| Reusable design tokens       | ⬜     | CSS variables output |

### Pages

| Feature                    | Status | Notes            |
| -------------------------- | ------ | ---------------- |
| Multi-page management      | ⬜     | Section 14       |
| Page settings (slug, meta) | ⬜     |                  |
| Page templates             | ⬜     | Template library |
| Dynamic pages (from CMS)   | ⬜     |                  |
| Global header/footer       | ⬜     | Section 14       |
| Navigation builder         | ⬜     | Menu editor      |

### CMS & Data

| Feature                      | Status | Notes                 |
| ---------------------------- | ------ | --------------------- |
| Rich text (ProseMirror)      | ✅     | ArkpadEditor          |
| API binding / dynamic data   | ✅     | Section 11            |
| Collections (content models) | ⬜     | Like Webflow CMS      |
| Media library                | ⬜     | Upload, CDN, optimize |
| Image optimization           | ⬜     | WebP, AVIF, resize    |

### SEO

| Feature                      | Status | Notes          |
| ---------------------------- | ------ | -------------- |
| Per-page meta title/desc     | ⬜     |                |
| Open Graph tags              | ⬜     |                |
| Canonical URLs               | ⬜     |                |
| 301 redirects                | ⬜     |                |
| XML sitemap                  | ⬜     | Auto-generated |
| Structured data (Schema.org) | ⬜     | JSON-LD        |
| Robots.txt                   | ⬜     |                |

### Publishing

| Feature                | Status | Notes |
| ---------------------- | ------ | ----- |
| Draft/publish workflow | ⬜     |       |
| Version history        | ⬜     |       |
| Scheduled publishing   | ⬜     |       |
| Audit log              | ⬜     |       |

### Business

| Feature                    | Status | Notes                 |
| -------------------------- | ------ | --------------------- |
| Multi-tenant / white-label | ⬜     | SAAS ready            |
| Team collaboration         | ⬜     | Roles, permissions    |
| Custom domains             | ⬜     |                       |
| Analytics (GA4, Plausible) | ⬜     |                       |
| Form builder               | ⬜     | Contact, lead capture |
| Subscriptions / billing    | ⬜     | Stripe integration    |

### Technical

| Feature                | Status | Notes              |
| ---------------------- | ------ | ------------------ |
| Code export (HTML/CSS) | ⬜     |                    |
| Next.js export         | ⬜     | SSR/SSG            |
| Custom code (CSS/JS)   | ⬜     | Per-page or global |
| CDN hosting            | ⬜     |                    |
| Image CDN              | ⬜     |                    |
| SSL                    | ⬜     |                    |

### AI

| Feature               | Status | Notes                 |
| --------------------- | ------ | --------------------- |
| AI content generation | ⬜     |                       |
| AI layout generation  | ⬜     | "Make a landing page" |
| AI image generation   | ⬜     |                       |

### Current Coverage

```
✅ Editor core (component system, DnD, styles, dynamic data) = ~15%
⬜ Design system + responsive + pages + SEO + CMS + publishing + business + AI = ~85%

We have the FOUNDATION — everything else is built ON TOP of the same
Zustand + config.components pattern. No architecture change needed.
```

---

## 17. Package Structure

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
Editor              → Arkpad Core (ProseMirror for richtext)
State               → Zustand (selective re-renders, devtools, external access)
Page structure      → Zustand JSON array (content: ComponentInstance[])
Component config    → config.components plain object — no schema needed
Third-party         → import + add to config.components key — done
Styles              → Figma-like StylePanel per block (inline CSS or Tailwind)
Responsive          → Per-breakpoint styles (desktop, tablet, mobile)
Dynamic data        → API binding (fetch + mapping + auto-refresh)
Design system       → Global theme (colors, fonts, spacing tokens)
Multi-page          → Full site with pages, navigation, global header/footer
Rendering           → config.components[type].render(props + styles + apiData + theme)
DnD                 → @dnd-kit (sortable array + palette drag-to-add)
SEO                 → Per-page meta, OG, sitemap, schema
Publishing          → Draft/publish, version history, rollback
SAAS                → Multi-tenant, white-label, teams, custom domains
Serialization       → JSON.stringify(siteStore.getSiteJSON())
Model inspiration   → Puck JS (data.content[] + config.components pattern)
Full scope          → Webflow / Builder.io / Framer level
```

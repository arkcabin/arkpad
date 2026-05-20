# Arkpad Layout & Responsive Engine

This document defines how Arkpad handles layout, alignment, and responsiveness using a "Flex-First" approach.

## 1. The Flexbox-First Philosophy

Arkpad uses Flexbox as the primary layout engine for its "Layout Kit." This ensures that pages are fluid, light, and automatically responsive.

### Key Benefits:

- **Automatic Wrapping:** Blocks can wrap to the next line without complex grid definitions.
- **Alignment Simplicity:** Vertical and horizontal centering is handled with standard flex attributes.
- **Mobile-First:** Changing layout direction from `row` to `col` is the standard way to handle mobile stacking.

## 2. Layout Attributes & Tailwind Mapping

The `Section` and `Columns` nodes will use the following attributes, which map directly to Tailwind classes:

| Attribute   | Logic                 | Tailwind Mapping                                     |
| :---------- | :-------------------- | :--------------------------------------------------- |
| `direction` | Row or Column         | `flex-row`, `flex-col`                               |
| `justify`   | Horizontal spacing    | `justify-start`, `justify-center`, `justify-between` |
| `align`     | Vertical alignment    | `items-start`, `items-center`, `items-end`           |
| `gap`       | Spacing between items | `gap-2`, `gap-4`, `gap-8`                            |
| `wrap`      | Multi-line support    | `flex-wrap`, `flex-nowrap`                           |

## 3. Responsive Breakpoints

Arkpad supports "Breakpoint Overrides" in the JSON structure. This allows users to set different layouts for different screens.

```json
{
  "type": "columns",
  "attrs": {
    "direction": "row",
    "responsive": {
      "sm": { "direction": "col" },
      "lg": { "direction": "row" }
    }
  }
}
```

## 4. The Spacing System (Margin & Padding)

Every block (Button, Card, Section) will inherit a "Spacing Attribute."

- **Standard Scale:** We follow the Tailwind spacing scale (0 to 96).
- **Visual UI:** The editor will show a "Handle" or "Slider" that updates these attributes in real-time.

## 5. Grid Fallback (The "Dashboard" Mode)

For complex, fixed-grid layouts (like Bento Grids), we provide a specialized `Grid` extension that uses CSS Grid instead of Flexbox. This is an optional block for advanced users.

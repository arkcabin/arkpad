import type { BlockMeta, BlockType } from "./types";

export const BLOCK_LIBRARY: BlockMeta[] = [
  {
    type: "heading",
    label: "Heading",
    icon: "H",
    defaultProps: { html: "<h2>Your Heading</h2>", level: 2, align: "left" },
  },
  {
    type: "text",
    label: "Text",
    icon: "¶",
    defaultProps: { html: "<p>Add your text content here.</p>", align: "left" },
  },
  {
    type: "image",
    label: "Image",
    icon: "🖼",
    defaultProps: { src: "", alt: "Image", width: "100%", align: "center" },
  },
  {
    type: "button",
    label: "Button",
    icon: "⬛",
    defaultProps: { html: "<p>Click Me</p>", href: "#", variant: "primary", align: "center" },
  },
  {
    type: "divider",
    label: "Divider",
    icon: "—",
    defaultProps: { color: "#d1d5db", thickness: 1, style: "solid" },
  },
  {
    type: "columns",
    label: "Columns",
    icon: "⊞",
    defaultProps: { count: 2, gap: 24, children: [[], []] },
  },
  {
    type: "video",
    label: "Video",
    icon: "▶",
    defaultProps: { url: "", autoplay: false },
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: "↕",
    defaultProps: { height: 40 },
  },
  {
    type: "quote",
    label: "Quote",
    icon: '\u201C',
    defaultProps: { html: "<p>An inspiring quote goes here.</p>", author: "Author Name" },
  },
];

export function getBlockMeta(type: BlockType): BlockMeta | undefined {
  return BLOCK_LIBRARY.find((b) => b.type === type);
}

export type BlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "columns"
  | "video"
  | "spacer"
  | "quote";

export interface BlockBase {
  id: string;
  type: BlockType;
}

export interface HeadingBlock extends BlockBase {
  type: "heading";
  props: { html: string; level: 1 | 2 | 3; align: "left" | "center" | "right" };
}

export interface TextBlock extends BlockBase {
  type: "text";
  props: { html: string; align: "left" | "center" | "right" };
}

export interface ImageBlock extends BlockBase {
  type: "image";
  props: { src: string; alt: string; width: string; align: "left" | "center" | "right" };
}

export interface ButtonBlock extends BlockBase {
  type: "button";
  props: {
    html: string;
    href: string;
    variant: "primary" | "secondary" | "outline";
    align: "left" | "center" | "right";
  };
}

export interface DividerBlock extends BlockBase {
  type: "divider";
  props: { color: string; thickness: number; style: "solid" | "dashed" | "dotted" };
}

export interface ColumnsBlock extends BlockBase {
  type: "columns";
  props: { count: 2 | 3; gap: number; children: Block[][] };
}

export interface VideoBlock extends BlockBase {
  type: "video";
  props: { url: string; autoplay: boolean };
}

export interface SpacerBlock extends BlockBase {
  type: "spacer";
  props: { height: number };
}

export interface QuoteBlock extends BlockBase {
  type: "quote";
  props: { html: string; author: string };
}

export type Block =
  | HeadingBlock
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | ColumnsBlock
  | VideoBlock
  | SpacerBlock
  | QuoteBlock;

export interface BlockMeta {
  type: BlockType;
  label: string;
  icon: string;
  defaultProps: Block["props"];
}

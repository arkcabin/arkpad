import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Playground } from "./playground";
import { FeatureDemo } from "./feature-demo";
import type { ReactNode } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Highlighter,
  Superscript,
  Subscript,
  Link as LinkIcon,
  Type,
  Quote,
  Minus,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Image,
  AlignCenter,
  Undo,
  TextCursor,
  Pointer,
  Palette,
  Wrench,
  Compass,
  Puzzle,
  BookOpen,
  Folder,
  Terminal,
  Rocket,
  Zap,
  Play,
} from "lucide-react";

const iconMap: Record<string, ReactNode> = {
  bold: <Bold className="size-4" />,
  italic: <Italic className="size-4" />,
  underline: <Underline className="size-4" />,
  strike: <Strikethrough className="size-4" />,
  code: <Code className="size-4" />,
  highlight: <Highlighter className="size-4" />,
  superscript: <Superscript className="size-4" />,
  subscript: <Subscript className="size-4" />,
  link: <LinkIcon className="size-4" />,
  type: <Type className="size-4" />,
  quote: <Quote className="size-4" />,
  "code-block": <Code className="size-4" />,
  "horizontal-rule": <Minus className="size-4" />,
  "text-alignment": <AlignCenter className="size-4" />,
  list: <List className="size-4" />,
  "bullet-list": <List className="size-4" />,
  "ordered-list": <ListOrdered className="size-4" />,
  "task-list": <CheckSquare className="size-4" />,
  table: <Table className="size-4" />,
  image: <Image className="size-4" />,
  history: <Undo className="size-4" />,
  placeholder: <TextCursor className="size-4" />,
  pointer: <Pointer className="size-4" />,
  palette: <Palette className="size-4" />,
  wrench: <Wrench className="size-4" />,
  compass: <Compass className="size-4" />,
  puzzle: <Puzzle className="size-4" />,
  "book-open": <BookOpen className="size-4" />,
  folder: <Folder className="size-4" />,
  terminal: <Terminal className="size-4" />,
  rocket: <Rocket className="size-4" />,
  zap: <Zap className="size-4" />,
  play: <Play className="size-4" />,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const OrigCard = defaultMdxComponents.Card as React.ComponentType<any>;

function Card({ icon, title, children, href, ...props }: Record<string, unknown>) {
  const IconComponent = typeof icon === "string" ? iconMap[icon] : null;
  return (
    <OrigCard
      title={
        <span className="inline-flex items-center gap-2">
          {IconComponent}
          <span>{title as string}</span>
        </span>
      }
      {...props}
      {...(href ? { href } : {})}
    >
      {children}
    </OrigCard>
  );
}

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    FeatureDemo,
    Card,
    Playground,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}

"use client";

import React, { useMemo } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Engine, ArkpadExtension } from "@arkpad/core";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Underline } from "@arkpad/extension-underline";
import { Strike } from "@arkpad/extension-strike";
import { Code } from "@arkpad/extension-code";
import { Highlight } from "@arkpad/extension-highlight";
import { Superscript } from "@arkpad/extension-superscript";
import { Subscript } from "@arkpad/extension-subscript";
import { Link } from "@arkpad/extension-link";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { TaskList } from "@arkpad/extension-task-list";
import { Table } from "@arkpad/extension-table";
import { Image } from "@arkpad/extension-image";
import { EraserTool } from "@arkpad/extension-eraser";
import { HighlighterTool } from "@arkpad/extension-highlighter";
import { AI } from "@arkpad/extension-ai";

import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Highlighter,
  Code as CodeIcon,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Layout,
  Link as LinkIcon,
} from "lucide-react";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";

// Custom Heading Icons for H4-H6 (matching lucide style)
const Heading4 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 10l3 5v2h-3" />
    <path d="M21 15h-4" />
  </svg>
);

const Heading5 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 13v-3h4" />
    <path d="M17 17a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3" />
  </svg>
);

const Heading6 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <circle cx="19" cy="16" r="3" />
    <path d="M22 13a3 3 0 0 0-3-3 3 3 0 0 0-3 3" />
  </svg>
);

const extensionMap: Record<string, ArkpadExtension[]> = {
  bold: [Engine, Bold],
  italic: [Engine, Italic],
  underline: [Engine, Underline],
  strike: [Engine, Strike],
  heading: [Engine, Heading],
  blockquote: [Engine, Blockquote],
  list: [Engine, BulletList, OrderedList, TaskList],
  taskList: [Engine, TaskList],
  table: [Engine, Heading, Table],
  highlight: [Engine, Highlight],
  code: [Engine, Code],
  link: [Engine, Heading, Link],
  image: [Engine, Heading, Image],
  superscript: [Engine, Superscript],
  subscript: [Engine, Subscript],
  ai: [Engine, Heading, AI],
  "eraser-tool": [Engine, Heading, Highlight, EraserTool],
  "highlighter-tool": [Engine, Heading, Highlight, HighlighterTool],
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Bold: BoldIcon,
  Italic: ItalicIcon,
  Underline: UnderlineIcon,
  Strike: StrikeIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Table: TableIcon,
  Highlighter,
  Code: CodeIcon,
  Link: LinkIcon,
  AddRowBefore: Plus,
  DeleteTable: Trash2,
  MoveRowUp: ChevronUp,
  MoveRowDown: ChevronDown,
};

interface FeatureDemoProps {
  feature: string;
  content: string;
  commands: {
    label: string;
    command: string;
    icon: string;
    args?: unknown;
    isActive?: string | [string, Record<string, unknown>];
  }[];
}

export function FeatureDemo({ feature, content, commands }: FeatureDemoProps) {
  const extensions = useMemo(
    () => (extensionMap[feature] || [Engine]) as ArkpadExtension[],
    [feature]
  );

  const editor = useArkpadEditor({
    extensions,
    content,
    autofocus: true,
  });

  const sourceCode = useMemo(() => {
    const extNames = extensions
      .filter((e) => e.name !== "engine")
      .map((e) => e.name.charAt(0).toUpperCase() + e.name.slice(1))
      .join(", ");

    return `import { useArkpadEditor, ArkpadEditorContent } from '@arkpad/react';
import { Engine } from '@arkpad/core';
import { ${extNames} } from '@arkpad/extension-${feature}';

export default function Demo() {
  const editor = useArkpadEditor({
    extensions: [Engine, ${extNames}],
    content: \`${content}\`,
  });

  return <ArkpadEditorContent editor={editor} />;
}`;
  }, [feature, content, extensions]);

  if (!editor) return null;

  return (
    <div className="my-12 overflow-hidden">
      <Tabs items={["Preview", "Code"]}>
        <Tab value="Preview">
          <div className="bg-fd-background">
            <ArkpadProvider editor={editor}>
              <div className="flex flex-col min-h-[400px]">
                {/* Minimalist Toolbar - Just a bottom line */}
                <div className="flex items-center gap-1.5 py-3 border-b border-fd-border sticky top-0 z-10 bg-fd-background">
                  <div className="flex items-center gap-0.5">
                    {commands.map((cmd) => {
                      const Icon = iconMap[cmd.icon] || Layout;
                      const activeName = Array.isArray(cmd.isActive) ? cmd.isActive[0] : cmd.isActive;
                      const activeAttrs = Array.isArray(cmd.isActive) ? cmd.isActive[1] : undefined;

                      return (
                        <EditorButton
                          key={cmd.label}
                          command={cmd.command}
                          args={cmd.args !== undefined ? [cmd.args] : undefined}
                          name={activeName}
                          attrs={activeAttrs}
                          title={cmd.label}
                          className="p-2 rounded-md transition-all hover:bg-fd-secondary text-fd-muted-foreground [&.active]:bg-fd-primary/10 [&.active]:text-fd-primary disabled:opacity-30 disabled:cursor-not-allowed"
                          activeClassName="active"
                        >
                          <Icon className="size-4" />
                        </EditorButton>
                      );
                    })}
                  </div>
                </div>

                {/* Flat Canvas Viewport */}
                <div className="flex-1">
                  <ArkpadEditorContent editor={editor} />
                </div>
              </div>
            </ArkpadProvider>
          </div>
        </Tab>

        <Tab value="Code">
          <div className="rounded-xl border border-fd-border overflow-hidden bg-fd-background">
            <div className="p-0 overflow-auto max-h-[600px]">
              <pre className="p-6 text-[13px] leading-relaxed font-mono text-fd-foreground/70">
                <code>{sourceCode}</code>
              </pre>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}




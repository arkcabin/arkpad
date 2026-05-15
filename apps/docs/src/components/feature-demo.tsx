"use client";

import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Engine } from "@arkpad/core";
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
import { CodeBlock } from "@arkpad/extension-code-block";
import { HorizontalRule } from "@arkpad/extension-horizontal-rule";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { TaskList } from "@arkpad/extension-task-list";
import { Table } from "@arkpad/extension-table";
import { Image } from "@arkpad/extension-image";
import { BubbleMenu } from "@arkpad/extension-bubble-menu";
import { FloatingMenu } from "@arkpad/extension-floating-menu";
import { Placeholder } from "@arkpad/extension-placeholder";
import { Color } from "@arkpad/extension-color";
import { FontFamily } from "@arkpad/extension-font-family";
import { FontSize } from "@arkpad/extension-font-size";
import { Typography } from "@arkpad/extension-typography";
import { EraserTool } from "@arkpad/extension-eraser";
import { HighlighterTool } from "@arkpad/extension-highlighter";

const extensionMap: Record<string, unknown[]> = {
  bold: [Engine, Bold],
  italic: [Engine, Italic],
  underline: [Engine, Underline],
  strike: [Engine, Strike],
  code: [Engine, Code],
  highlight: [Engine, Highlight],
  superscript: [Engine, Superscript],
  subscript: [Engine, Subscript],
  link: [Engine, Link],
  heading: [Engine, Heading],
  blockquote: [Engine, Blockquote],
  "code-block": [Engine, CodeBlock],
  "horizontal-rule": [Engine, HorizontalRule],
  "bullet-list": [Engine, BulletList],
  "ordered-list": [Engine, OrderedList],
  "task-list": [Engine, TaskList],
  table: [Engine, Table],
  image: [Engine, Image],
  "bubble-menu": [Engine, BubbleMenu],
  "floating-menu": [Engine, FloatingMenu],
  placeholder: [Engine, Placeholder],
  color: [Engine, Color],
  "font-family": [Engine, FontFamily],
  "font-size": [Engine, FontSize],
  list: [Engine, BulletList, OrderedList],
  typography: [Engine, Typography],
  "text-alignment": [Engine],
  "eraser-tool": [Engine, EraserTool],
  "highlighter-tool": [Engine, HighlighterTool],
  markdown: [Engine],
  ai: [Engine],
  youtube: [Engine],
};

interface DemoCommand {
  label: string;
  command: string;
  args?: unknown;
  isActive?: string | [string, Record<string, unknown>];
}

interface FeatureDemoProps {
  feature: string;
  content: string;
  commands?: DemoCommand[];
  code?: string;
}

export function FeatureDemo({ feature, content, commands, code }: FeatureDemoProps) {
  const extensions = (extensionMap[feature] || [Engine]) as unknown[];
  const editor = useArkpadEditor({ extensions, content });

  return (
    <div className="rounded-xl border overflow-hidden my-6 not-prose">
      {commands && commands.length > 0 && editor && (
        <ArkpadProvider editor={editor}>
          <div className="flex flex-wrap gap-1 p-2 border-b bg-fd-secondary/50">
            {commands.map((cmd) => {
              const activeName = Array.isArray(cmd.isActive) ? cmd.isActive[0] : cmd.isActive;
              const activeAttrs = Array.isArray(cmd.isActive) ? cmd.isActive[1] : undefined;
              return (
                <EditorButton
                  key={cmd.label}
                  command={cmd.command}
                  args={cmd.args !== undefined ? [cmd.args] : undefined}
                  name={activeName}
                  attrs={activeAttrs}
                  className="px-2.5 py-1 text-xs rounded-md font-medium hover:bg-fd-accent text-fd-muted-foreground [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
                  activeClassName="active"
                >
                  {cmd.label}
                </EditorButton>
              );
            })}
          </div>
        </ArkpadProvider>
      )}
      <div className="p-4 min-h-[120px] bg-fd-card">
        {editor && <ArkpadEditorContent editor={editor} />}
      </div>
      {code && (
        <details className="border-t group">
          <summary className="px-4 py-2 text-xs text-fd-muted-foreground cursor-pointer hover:text-fd-foreground font-mono select-none">
            Show code
          </summary>
          <pre className="p-4 m-0 text-xs bg-fd-secondary/30 overflow-x-auto border-t">
            <code>{code}</code>
          </pre>
        </details>
      )}
    </div>
  );
}

"use client";

import React from "react";
import {
  useArkpadEditor,
  ArkpadEditorContent,
  ArkpadProvider,
  FloatingMenu,
  EditorButton,
  DropdownMenu,
} from "@arkpad/react";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Underline } from "@arkpad/extension-underline";
import { Strike } from "@arkpad/extension-strike";
import { Code } from "@arkpad/extension-code";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { ListItem } from "@arkpad/extension-list-item";
import { Link } from "@arkpad/extension-link";
import { Highlight } from "@arkpad/extension-highlight";
import { createTextAlign } from "@arkpad/extension-alignment";
import { Engine } from "@arkpad/core";

export function FloatingMenuDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Heading,
      Blockquote,
      BulletList,
      OrderedList,
      ListItem,
      Link,
      Highlight,
      createTextAlign(),
    ],
    content: `
      <h1>Floating Menu Demo</h1>
      <p>Click inside an empty paragraph below to see the floating menu appear at the cursor position.</p>
      <p></p>
      <p>The floating menu provides quick access to formatting options right where you're typing.</p>
      <p></p>
      <p>Try clicking in one of the empty paragraphs above to see the floating menu in action.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="p-6 min-h-[200px]">
          <ArkpadEditorContent
            editor={editor}
            className="prose dark:prose-invert focus:outline-none max-w-none"
          />
        </div>
        <FloatingMenu editor={editor}>
          <div className="flex items-center gap-0.5 px-2 py-1.5 bg-fd-background rounded-lg shadow-lg border border-fd-border">
            <EditorButton
              command="toggleBold"
              name="bold"
              className="p-1.5 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
              activeClassName="active"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
              </svg>
            </EditorButton>
            <EditorButton
              command="toggleItalic"
              name="italic"
              className="p-1.5 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
              activeClassName="active"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="19" x2="10" y1="4" y2="4" />
                <line x1="14" x2="5" y1="20" y2="20" />
                <line x1="15" x2="9" y1="4" y2="20" />
              </svg>
            </EditorButton>
            <EditorButton
              command="toggleUnderline"
              name="underline"
              className="p-1.5 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
              activeClassName="active"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 4v6a6 6 0 0 0 12 0V4" />
                <line x1="4" x2="20" y1="20" y2="20" />
              </svg>
            </EditorButton>
            <EditorButton
              command="toggleStrike"
              name="strike"
              className="p-1.5 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
              activeClassName="active"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                <path d="M14 12a4 4 0 0 1 0 8H6" />
                <line x1="4" x2="20" y1="12" y2="12" />
              </svg>
            </EditorButton>
            <div className="w-px h-4 bg-fd-border mx-1" />
            <DropdownMenu layout="vertical">
              <DropdownMenu.Trigger className="p-1.5 rounded hover:bg-fd-accent text-fd-muted-foreground text-[10px] font-bold px-1">
                H<span className="text-[8px] opacity-60">▾</span>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="start" side="top" minWidth={140}>
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <DropdownMenu.Item
                    key={level}
                    command="toggleHeading"
                    name="heading"
                    attrs={{ level }}
                  >
                    <span className="font-semibold text-fd-muted-foreground mr-2 w-5 text-right">
                      H{level}
                    </span>
                    <span>Heading {level}</span>
                  </DropdownMenu.Item>
                ))}
                <DropdownMenu.Separator />
                <DropdownMenu.Item command="setParagraph" name="paragraph">
                  <span className="text-fd-muted-foreground mr-2 w-5 text-right font-mono">¶</span>
                  <span>Paragraph</span>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </FloatingMenu>
      </div>
    </ArkpadProvider>
  );
}

export const floatingMenuCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, FloatingMenu } from "@arkpad/react";
import { Engine } from "@arkpad/core";

export function FloatingMenuDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine],
    content: "<p>Click in empty paragraph to see floating menu.</p><p></p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <ArkpadEditorContent editor={editor} />
      <FloatingMenu editor={editor}>{/* custom toolbar */}</FloatingMenu>
    </ArkpadProvider>
  );
}`;

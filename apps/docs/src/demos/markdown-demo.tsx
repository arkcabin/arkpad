"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { createMarkdownPaste } from "@arkpad/extension-markdown";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Heading } from "@arkpad/extension-heading";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { ListItem } from "@arkpad/extension-list-item";
import { Code } from "@arkpad/extension-code";
import { CodeBlock } from "@arkpad/extension-code-block";
import { Blockquote } from "@arkpad/extension-blockquote";
import { HorizontalRule } from "@arkpad/extension-horizontal-rule";
import { Engine } from "@arkpad/core";

export function MarkdownDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Heading,
      Bold,
      Italic,
      Code,
      CodeBlock,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      HorizontalRule,
      createMarkdownPaste(),
    ],
    content:
      "<h1>Markdown Paste</h1><p>Copy markdown text from anywhere and paste it directly into this editor. It will be converted to rich text automatically.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="arkpad-content-area focus:outline-none max-w-none"
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const markdownCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { createMarkdownPaste } from "@arkpad/extension-markdown";
import { Engine } from "@arkpad/core";

export function MarkdownDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, createMarkdownPaste()],
    content: "<p>Paste markdown here!</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

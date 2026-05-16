"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Blockquote as BlockquoteExtension } from "@arkpad/extension-blockquote";
import { Engine } from "@arkpad/core";
import { Quote } from "lucide-react";

export function BlockquoteDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, BlockquoteExtension],
    content: `
      <p>The blockquote extension allows you to wrap content in a quotation block.</p>
      <blockquote><p>This is a blockquote. It can contain multiple paragraphs.</p></blockquote>
    `,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleBlockquote"
            name="blockquote"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <Quote className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="prose dark:prose-invert focus:outline-none max-w-none"
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const blockquoteCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Blockquote } from "@arkpad/extension-blockquote";
import { Engine } from "@arkpad/core";
import { Quote } from "lucide-react";

export function BlockquoteDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Blockquote],
    content: "<blockquote><p>Quote here</p></blockquote>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleBlockquote" name="blockquote">
            <Quote className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

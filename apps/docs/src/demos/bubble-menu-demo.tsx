"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, BubbleMenu } from "@arkpad/react";
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
import { Engine } from "@arkpad/core";

export function BubbleMenuDemo() {
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
    ],
    content: `
      <h1>Bubble Menu Demo</h1>
      <p>Select any text to see the bubble menu appear above your selection with formatting options.</p>
      <p><strong>Try it:</strong> Select this text to see bold, italic, underline, and more options.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="p-6 min-h-[200px]">
          <ArkpadEditorContent
            editor={editor}
            className="arkpad-content-area focus:outline-none max-w-none"
          />
        </div>
        <BubbleMenu editor={editor} defaultToolbar />
      </div>
    </ArkpadProvider>
  );
}

export const bubbleMenuCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, BubbleMenu } from "@arkpad/react";
import { Engine } from "@arkpad/core";

export function BubbleMenuDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine],
    content: "<p>Select text to see the bubble menu.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <ArkpadEditorContent editor={editor} />
      <BubbleMenu editor={editor} defaultToolbar />
    </ArkpadProvider>
  );
}`;

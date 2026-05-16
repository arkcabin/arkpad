"use client";

import React from "react";
import { Placeholder, Engine } from "@arkpad/core";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";

export function PlaceholderDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Heading,
      Blockquote,
      BulletList,
      Placeholder.configure({
        placeholder: "Start writing...",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
        showOnlyCurrent: true,
      }),
    ],
    content: "<h1></h1><p></p><blockquote><p></p></blockquote>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
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

export const placeholderCode = `
import React from "react";
import { Placeholder, Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";

export function PlaceholderDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Placeholder.configure({
        placeholder: "Start writing...",
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
    ],
    content: "<p></p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

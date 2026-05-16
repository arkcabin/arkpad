"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Highlight } from "@arkpad/extension-highlight";
import { Engine } from "@arkpad/core";
import { Highlighter } from "lucide-react";

export function HighlightDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Highlight],
    content:
      "<p>This editor supports <mark style='background-color: #ffff00'>highlights</mark>. Try selecting text and clicking the highlighter icon or pressing Mod+Shift+H.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleHighlight"
            name="highlight"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <Highlighter className="w-4 h-4" />
          </EditorButton>
        </div>
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

export const highlightCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Highlight } from "@arkpad/extension-highlight";
import { Engine } from "@arkpad/core";
import { Highlighter } from "lucide-react";

export function HighlightDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Highlight],
    content: "<p>Highlight <mark>text</mark> in your editor.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleHighlight" name="highlight">
            <Highlighter className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

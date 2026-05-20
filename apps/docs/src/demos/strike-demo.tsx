"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Strike as StrikeExtension } from "@arkpad/extension-strike";
import { Engine } from "@arkpad/core";
import { Strikethrough as StrikeIcon } from "lucide-react";

export function StrikeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, StrikeExtension],
    content:
      "<p>This editor handles <del>strikethrough</del> text. Try selecting this text and pressing Mod+Shift+S.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleStrike"
            name="strike"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <StrikeIcon className="w-4 h-4" />
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

export const strikeCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Strike } from "@arkpad/extension-strike";
import { Engine } from "@arkpad/core";
import { Strikethrough as StrikeIcon } from "lucide-react";

export function StrikeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Strike],
    content: "<p>This editor handles strikethrough text.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleStrike" name="strike">
            <StrikeIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Underline as UnderlineExtension } from "@arkpad/extension-underline";
import { Engine } from "@arkpad/core";
import { Underline as UnderlineIcon } from "lucide-react";

export function UnderlineDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, UnderlineExtension],
    content:
      "<p>This editor handles <u>underline</u> text. Try selecting this text and pressing Mod+U.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleUnderline"
            name="underline"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <UnderlineIcon className="w-4 h-4" />
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

export const underlineCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Underline } from "@arkpad/extension-underline";
import { Engine } from "@arkpad/core";
import { Underline as UnderlineIcon } from "lucide-react";

export function UnderlineDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Underline],
    content: "<p>This editor handles underline text.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleUnderline" name="underline">
            <UnderlineIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

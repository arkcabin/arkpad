"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Italic as ItalicExtension } from "@arkpad/extension-italic";
import { Engine } from "@arkpad/core";
import { Italic as ItalicIcon } from "lucide-react";

export function ItalicDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, ItalicExtension],
    content:
      "<p>This editor <em>only</em> handles emphasis. <i>Italic text</i> helps highlight key points without changing the weight of the font.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleItalic"
            name="italic"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <ItalicIcon className="w-4 h-4" />
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

export const italicCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Italic } from "@arkpad/extension-italic";
import { Engine } from "@arkpad/core";
import { Italic as ItalicIcon } from "lucide-react";

export function ItalicDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Italic],
    content: "<p>This editor <em>only</em> handles emphasis.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleItalic" name="italic">
            <ItalicIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

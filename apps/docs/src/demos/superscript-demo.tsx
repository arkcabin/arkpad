"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Superscript as SuperscriptExtension } from "@arkpad/extension-superscript";
import { Engine } from "@arkpad/core";
import { Superscript as SupIcon } from "lucide-react";

export function SuperscriptDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, SuperscriptExtension],
    content:
      "<p>The superscript extension allows you to render text above the baseline, useful for mathematical exponents like E=mc<sup>2</sup> or ordinal indicators like 1<sup>st</sup>.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleSuperscript"
            name="superscript"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <SupIcon className="w-4 h-4" />
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

export const superscriptCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Superscript } from "@arkpad/extension-superscript";
import { Engine } from "@arkpad/core";
import { Superscript as SupIcon } from "lucide-react";

export function SuperscriptDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Superscript],
    content: "<p>E=mc<sup>2</sup> - superscript example.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleSuperscript" name="superscript">
            <SupIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

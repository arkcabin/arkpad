"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Subscript as SubscriptExtension } from "@arkpad/extension-subscript";
import { Engine } from "@arkpad/core";
import { Subscript as SubIcon } from "lucide-react";

export function SubscriptDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, SubscriptExtension],
    content:
      "<p>The subscript extension allows you to render text below the baseline, common in chemical formulas like H<sub>2</sub>O or mathematical notation.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleSubscript"
            name="subscript"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <SubIcon className="w-4 h-4" />
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

export const subscriptCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Subscript } from "@arkpad/extension-subscript";
import { Engine } from "@arkpad/core";
import { Subscript as SubIcon } from "lucide-react";

export function SubscriptDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Subscript],
    content: "<p>H<sub>2</sub>O - subscript example.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleSubscript" name="subscript">
            <SubIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { HorizontalRule as HorizontalRuleExtension } from "@arkpad/extension-horizontal-rule";
import { Engine } from "@arkpad/core";
import { Minus } from "lucide-react";

export function HorizontalRuleDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, HorizontalRuleExtension],
    content: `
      <p>This extension allows you to insert a thematic break between blocks of content.</p>
      <hr />
      <p>Click the divider icon or type <code>---</code> on a new line.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="setHorizontalRule"
            name="horizontalRule"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
            activeClassName="active"
          >
            <Minus className="w-4 h-4" />
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

export const horizontalRuleCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { HorizontalRule } from "@arkpad/extension-horizontal-rule";
import { Engine } from "@arkpad/core";
import { Minus } from "lucide-react";

export function HorizontalRuleDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, HorizontalRule],
    content: "<p>Content above</p><hr /><p>Content below</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="setHorizontalRule" name="horizontalRule">
            <Minus className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

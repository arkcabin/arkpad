'use client';

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Bold } from "@arkpad/extension-bold";
import { Engine } from "@arkpad/core";
import { Bold as BoldIcon } from "lucide-react";

export function BoldDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Bold],
    content: "<p>Try making some text <strong>bold</strong> using the button below!</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleBold"
            name="strong"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <BoldIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="focus:outline-none"
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const boldCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Bold } from "@arkpad/extension-bold";
import { Engine } from "@arkpad/core";
import { Bold as BoldIcon } from "lucide-react";

export function BoldDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Bold],
    content: "<p>Try making some text bold using the button below!</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleBold" name="strong">
            <BoldIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

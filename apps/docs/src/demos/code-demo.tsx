"use client";

import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { Code as CodeExtension } from "@arkpad/extension-code";
import { Engine } from "@arkpad/core";
import { Code as CodeIcon } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

export function CodeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, CodeExtension],
    content:
      "<p>The code extension allows you to mark inline text as <code>mono-spaced code</code>. This is perfect for technical documentation.</p>",
  });

  return (
    <DemoContainer editor={editor}>
      <EditorButton
        command="toggleCode"
        name="code"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
        activeClassName="active"
      >
        <CodeIcon className="w-4 h-4" />
      </EditorButton>
    </DemoContainer>
  );
}

export const codeCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Code } from "@arkpad/extension-code";
import { Engine } from "@arkpad/core";
import { Code as CodeIcon } from "lucide-react";

export function CodeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Code],
    content: "<p>Inline <code>code</code> formatting.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 border-b bg-muted/50">
          <EditorButton command="toggleCode" name="code">
            <CodeIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-4">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

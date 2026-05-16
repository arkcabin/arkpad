"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { CodeBlock as CodeBlockExtension } from "@arkpad/extension-code-block";
import { Engine } from "@arkpad/core";
import { Code2 } from "lucide-react";

export function CodeBlockDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, CodeBlockExtension],
    content: `
      <p>The code block extension allows you to embed source code with preserved whitespace.</p>
      <pre><code class="language-javascript">function hello() {
  console.log("Hello from Arkpad!");
}</code></pre>
    `,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleCodeBlock"
            name="codeBlock"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
          >
            <Code2 className="w-4 h-4" />
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

export const codeBlockCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { CodeBlock } from "@arkpad/extension-code-block";
import { Engine } from "@arkpad/core";
import { Code2 } from "lucide-react";

export function CodeBlockDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, CodeBlock],
    content: "<pre><code>console.log('hello');</code></pre>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b">
          <EditorButton command="toggleCodeBlock" name="codeBlock">
            <Code2 className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

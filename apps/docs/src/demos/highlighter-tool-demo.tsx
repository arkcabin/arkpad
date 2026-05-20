"use client";

import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { HighlighterTool } from "@arkpad/extension-highlighter";
import { Highlight } from "@arkpad/extension-highlight";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Highlighter } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

export function HighlighterToolDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Highlight, HighlighterTool],
    content:
      "<h1>Highlighter Tool</h1><p>Toggle the highlighter tool and select text to automatically apply highlights. Click the button below to enter highlighter mode, then select any text in the editor.</p><p>Try it out: click the highlighter button, then select this text to see it in action!</p>",
  });

  return (
    <DemoContainer editor={editor}>
      <EditorButton
        command="toggleHighlighterTool"
        name="highlighterTool"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
        activeClassName="active"
        title="Toggle Highlighter"
      >
        <Highlighter className="w-4 h-4" />
      </EditorButton>
    </DemoContainer>
  );
}

export const highlighterToolCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { HighlighterTool } from "@arkpad/extension-highlighter";
import { Highlight } from "@arkpad/extension-highlight";
import { Engine } from "@arkpad/core";
import { Highlighter } from "lucide-react";

export function HighlighterToolDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Highlight, HighlighterTool],
    content: "<p>Select text while highlighter is active.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 border-b bg-muted/50">
          <EditorButton command="toggleHighlighterTool" name="highlighterTool">
            <Highlighter className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-4">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;

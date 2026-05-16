"use client";

import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { EraserTool } from "@arkpad/extension-eraser";
import { Highlight } from "@arkpad/extension-highlight";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Eraser } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

export function EraserToolDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Highlight, EraserTool],
    content:
      '<h1>Eraser Tool</h1><p><mark style="background-color: #ffff00">This text has been highlighted.</mark> Use the eraser tool to remove highlights.</p><p><mark style="background-color: #ff9800">More highlighted text here</mark> — try erasing these highlights!</p>',
  });

  return (
    <DemoContainer editor={editor}>
      <EditorButton
        command="toggleEraserTool"
        name="eraserTool"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
        activeClassName="active"
        title="Toggle Eraser"
      >
        <Eraser className="w-4 h-4" />
      </EditorButton>
    </DemoContainer>
  );
}

export const eraserToolCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { EraserTool } from "@arkpad/extension-eraser";
import { Highlight } from "@arkpad/extension-highlight";
import { Engine } from "@arkpad/core";
import { Eraser } from "lucide-react";

export function EraserToolDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Highlight, EraserTool],
    content: "<p><mark>Highlighted text</mark> to erase.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 border-b bg-muted/50">
          <EditorButton command="toggleEraserTool" name="eraserTool">
            <Eraser className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-4">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;


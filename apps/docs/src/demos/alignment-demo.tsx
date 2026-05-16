"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { createTextAlign } from "@arkpad/extension-alignment";
import { Engine } from "@arkpad/core";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";

export function AlignmentDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, createTextAlign()],
    content:
      "<p style='text-align: left'>Left-aligned paragraph. Use the toolbar to change alignment.</p><p style='text-align: center'>Center-aligned text.</p><p style='text-align: right'>Right-aligned text.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="setTextAlign"
            args={["left"]}
            name="textAlign"
            attrs={{ align: "left" }}
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </EditorButton>
          <EditorButton
            command="setTextAlign"
            args={["center"]}
            name="textAlign"
            attrs={{ align: "center" }}
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </EditorButton>
          <EditorButton
            command="setTextAlign"
            args={["right"]}
            name="textAlign"
            attrs={{ align: "right" }}
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </EditorButton>
          <div className="w-px h-4 bg-fd-border mx-1" />
          <EditorButton
            command="setTextAlign"
            args={["justify"]}
            name="textAlign"
            attrs={{ align: "justify" }}
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4" />
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

export const alignmentCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { createTextAlign } from "@arkpad/extension-alignment";
import { Engine } from "@arkpad/core";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

export function AlignmentDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, createTextAlign()],
    content: "<p>Change alignment of this text.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <EditorButton command="setTextAlign" args={["left"]} name="textAlign" attrs={{ align: "left" }} />
      <EditorButton command="setTextAlign" args={["center"]} name="textAlign" attrs={{ align: "center" }} />
      <EditorButton command="setTextAlign" args={["right"]} name="textAlign" attrs={{ align: "right" }} />
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

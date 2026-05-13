import { EraserTool } from "@arkpad/extension-eraser";
import { Highlight } from "@arkpad/extension-highlight";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Eraser } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function EraserToolDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Highlight, EraserTool],
    content:
      '<h1>Eraser Tool</h1><p><mark style="background-color: #ffff00">This text has been highlighted.</mark> Use the eraser tool to remove highlights by selecting highlighted text while eraser mode is active.</p><p><mark style="background-color: #ff9800">More highlighted text here</mark> — try erasing these highlights!</p>',
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Tool Extension"
      title="Eraser Tool"
      description="Remove highlights and formatting by selecting text while in eraser mode. The perfect companion to the highlighter tool."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleEraserTool"
              name="eraserTool"
              className="toolbar-btn"
              activeClassName="active"
              title="Toggle Eraser"
            >
              <Eraser className="w-4 h-4" />
            </EditorButton>
          </div>
          <div className="p-8">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

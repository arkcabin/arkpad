import { HighlighterTool } from "@arkpad/extension-highlighter";
import { Highlight } from "@arkpad/extension-highlight";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Highlighter } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function HighlighterToolDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Highlight, HighlighterTool],
    content:
      "<h1>Highlighter Tool</h1><p>Toggle the highlighter tool and select text to automatically apply highlights. Click the button below to enter highlighter mode, then select any text in the editor.</p><p>Try it out: click the highlighter button, then select this text to see it in action!</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Tool Extension"
      title="Highlighter Tool"
      description="A paint-like highlighter tool that auto-applies highlight marks to any text you select while active."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleHighlighterTool"
              name="highlighterTool"
              className="toolbar-btn"
              activeClassName="active"
              title="Toggle Highlighter"
            >
              <Highlighter className="w-4 h-4" />
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

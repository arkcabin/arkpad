import { Highlight } from "@arkpad/extension-highlight";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Highlighter } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function HighlightDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Highlight],
    content:
      "<h1>Highlights</h1><p>This editor supports <mark style='background-color: #ffff00'>highlights</mark>. Try selecting text and clicking the highlighter icon or pressing Mod+Shift+H.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Highlight"
      description="Highlights text with a background color."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleHighlight"
              name="highlight"
              className="toolbar-btn"
              activeClassName="active"
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

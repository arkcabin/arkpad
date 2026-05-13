import { createTextAlign } from "@arkpad/extension-alignment";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function AlignmentDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, createTextAlign()],
    content:
      "<h1>Text Alignment</h1><p style='text-align: left'>This paragraph is aligned to the left. Use the toolbar buttons above to change alignment.</p><p style='text-align: center'>Center-aligned text works great for headings and short statements.</p><p style='text-align: right'>Right-alignment can be useful for captions and annotations.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Alignment"
      description="Control text alignment across your document with left, center, right, and justify options."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center gap-1">
            <EditorButton
              command="setTextAlign"
              args={["left"]}
              name="textAlign"
              attrs={{ align: "left" }}
              className="toolbar-btn"
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
              className="toolbar-btn"
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
              className="toolbar-btn"
              activeClassName="active"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </EditorButton>
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <EditorButton
              command="setTextAlign"
              args={["justify"]}
              name="textAlign"
              attrs={{ align: "justify" }}
              className="toolbar-btn"
              activeClassName="active"
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
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

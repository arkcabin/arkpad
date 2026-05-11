import { HorizontalRule as HorizontalRuleExtension } from "@arkpad/extension-horizontal-rule";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Minus } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function HorizontalRuleDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, HorizontalRuleExtension],
    content: `
      <h1>Horizontal Rule Extension</h1>
      <p>This extension allows you to insert a thematic break or horizontal rule between blocks of content.</p>
      <hr />
      <p>Try clicking the divider icon in the toolbar or typing <code>---</code> on a new line to insert a horizontal rule.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Horizontal Rule"
      description="Inserts a visual thematic break between content blocks."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="setHorizontalRule"
              name="horizontalRule"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Insert Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
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

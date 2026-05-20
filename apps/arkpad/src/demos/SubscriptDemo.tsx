import { Subscript as SubscriptExtension } from "@arkpad/extension-subscript";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Subscript as SubIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function SubscriptDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, SubscriptExtension],
    content:
      "<h1>Subscript</h1><p>The subscript extension allows you to render text below the baseline, common in chemical formulas like H<sub>2</sub>O or mathematical notation.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Subscript"
      description="Toggles subscript formatting on selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleSubscript"
              name="subscript"
              className="toolbar-btn"
              activeClassName="active"
            >
              <SubIcon className="w-4 h-4" />
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

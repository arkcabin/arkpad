import { Superscript as SuperscriptExtension } from "@arkpad/extension-superscript";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Superscript as SupIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function SuperscriptDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, SuperscriptExtension],
    content:
      "<h1>Superscript Extension</h1><p>Mathematical formulas: x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup>. Try Mod+.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Superscript"
      description="Toggles superscript formatting on selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleSuperscript"
              name="superscript"
              className="toolbar-btn"
              activeClassName="active"
            >
              <SupIcon className="w-4 h-4" />
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

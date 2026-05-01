import { Underline as UnderlineExtension } from "@arkpad/extension-underline";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Underline as UnderlineIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function UnderlineDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, UnderlineExtension],
    content:
      "<h1>Underline Extension</h1><p>This editor handles <u>underline</u> text. Try selecting this text and pressing Mod+U.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Underline"
      description="Toggles underline formatting on selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleUnderline"
              name="underline"
              className="toolbar-btn"
              activeClassName="active"
            >
              <UnderlineIcon className="w-4 h-4" />
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

import { Strike as StrikeExtension } from "@arkpad/extension-strike";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Strikethrough as StrikeIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function StrikeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, StrikeExtension],
    content:
      "<h1>Strike Extension</h1><p>This editor handles <del>strikethrough</del> text. Try selecting this text and pressing Mod+Shift+S.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Strike"
      description="Toggles strikethrough formatting on selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleStrike"
              name="strike"
              className="toolbar-btn"
              activeClassName="active"
            >
              <StrikeIcon className="w-4 h-4" />
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

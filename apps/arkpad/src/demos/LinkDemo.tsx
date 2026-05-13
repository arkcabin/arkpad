import { Link as LinkExtension } from "@arkpad/extension-link";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Link as LinkIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function LinkDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, LinkExtension],
    content:
      '<h1>Hyperlinks</h1><p>This editor supports <a href="https://arkpad.dev">clickable hyperlinks</a>. Select any text and click the link button or press Mod+K to add or edit a link.</p><p>Try selecting this sentence and adding a link to see how it works!</p>',
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Link"
      description="Add clickable hyperlinks to your text. Supports custom URLs and target attributes."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center gap-1">
            <EditorButton
              command="toggleLink"
              args={["https://example.com"]}
              name="link"
              className="toolbar-btn"
              activeClassName="active"
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
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

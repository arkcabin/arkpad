import { Code as CodeExtension } from "@arkpad/extension-code";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Code as CodeIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function CodeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, CodeExtension],
    content:
      "<h1>Inline Code</h1><p>The code extension allows you to mark inline text as <code>mono-spaced code</code>. This is perfect for technical documentation.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Inline Code"
      description="Toggles code formatting on selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleCode"
              name="code"
              className="toolbar-btn"
              activeClassName="active"
            >
              <CodeIcon className="w-4 h-4" />
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

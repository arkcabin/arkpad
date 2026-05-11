import { Blockquote as BlockquoteExtension } from "@arkpad/extension-blockquote";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Quote } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function BlockquoteDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, BlockquoteExtension],
    content: `
      <h1>Blockquote Extension</h1>
      <p>The blockquote extension allows you to wrap content in a quotation block.</p>
      <blockquote>
        <p>This is a blockquote. It can contain multiple paragraphs and other block elements.</p>
        <p>ProseMirror handles the nesting and structure automatically.</p>
      </blockquote>
      <p>Try selecting text and clicking the quote icon or pressing Mod+Shift+B.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Blockquote"
      description="Wraps one or more blocks in a quote container."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleBlockquote"
              name="blockquote"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Toggle Blockquote"
            >
              <Quote className="w-4 h-4" />
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

import { createMarkdownPaste } from "@arkpad/extension-markdown";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Heading } from "@arkpad/extension-heading";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { ListItem } from "@arkpad/extension-list-item";
import { Code } from "@arkpad/extension-code";
import { CodeBlock } from "@arkpad/extension-code-block";
import { Blockquote } from "@arkpad/extension-blockquote";
import { HorizontalRule } from "@arkpad/extension-horizontal-rule";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function MarkdownDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Heading,
      Bold,
      Italic,
      Code,
      CodeBlock,
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      HorizontalRule,
      createMarkdownPaste(),
    ],
    content:
      "<h1>Markdown Paste</h1><p>Copy markdown text from anywhere and paste it directly into this editor. It will be converted to rich text automatically.</p><p>Try copying this markdown block and pasting it here:</p><pre><code># Hello World\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2\n- Item 3</code></pre>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Utility Extension"
      title="Markdown Paste"
      description="Paste markdown-formatted text directly into the editor. Converts headings, bold, italic, lists, code blocks, and more to rich text automatically."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
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

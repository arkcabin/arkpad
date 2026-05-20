import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, BubbleMenu } from "@arkpad/react";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Underline } from "@arkpad/extension-underline";
import { Strike } from "@arkpad/extension-strike";
import { Code } from "@arkpad/extension-code";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { ListItem } from "@arkpad/extension-list-item";
import { Link } from "@arkpad/extension-link";
import { Highlight } from "@arkpad/extension-highlight";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function BubbleMenuDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Heading,
      Blockquote,
      BulletList,
      OrderedList,
      ListItem,
      Link,
      Highlight,
    ],
    content: `
      <h1>Bubble Menu Demo</h1>
      <p>Select any text to see the bubble menu appear above your selection with formatting options.</p>
      <p><strong>Try it:</strong> Select this text to see bold, italic, underline, and more options.</p>
      <h2>Features</h2>
      <ul>
        <li><strong>Collision Detection</strong> — The menu flips below when there's no room above.</li>
        <li><strong>Default Toolbar</strong> — Bold, Italic, Underline, Strike, Heading, Link, Lists, Blockquote, Code.</li>
        <li><strong>Customizable</strong> — Pass your own children to override the default toolbar.</li>
        <li><strong>Zero-Flicker</strong> — GPU-accelerated, RAF-synced positioning.</li>
      </ul>
      <p>This is a <em>demo page</em> for the BubbleMenu component. Select text in the paragraphs above to see the toolbar pop up.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Interaction"
      title="Bubble Menu"
      description="A context-aware floating toolbar that appears when text is selected."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col bg-[var(--bg-main)] relative">
          <div className="p-8 sm:p-16">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
          <BubbleMenu editor={editor} defaultToolbar />
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

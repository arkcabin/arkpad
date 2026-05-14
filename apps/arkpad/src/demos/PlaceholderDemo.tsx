import React from "react";
import { Placeholder, Engine } from "@arkpad/core";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function PlaceholderDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Heading,
      Blockquote,
      BulletList,
      Placeholder.configure({
        placeholder: "Start writing...",
        types: {
          heading: "Heading...",
          paragraph: "Type something...",
          blockquote: "Enter a quote...",
          bulletList: "Add list items...",
        },
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
        showOnlyCurrent: true,
      }),
    ],
    content: "<h1></h1><p></p><blockquote><p></p></blockquote>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="UX Extension"
      title="Placeholder"
      description="Contextual placeholder hints per node type. Try typing in different blocks or leaving them empty."
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

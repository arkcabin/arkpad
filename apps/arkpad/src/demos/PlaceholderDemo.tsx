import React from "react";
import { Placeholder } from "@arkpad/extension-placeholder";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function PlaceholderDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Heading,
      Placeholder.configure({
        placeholder: ({ node }: { node: any }) => {
          if (node.type.name === "heading") return "Heading...";
          return "Start typing or type '/' for commands...";
        },
      }),
    ],
    content: "<h1></h1><p></p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="UX Extension"
      title="Placeholder"
      description="Smart placeholder text that guides users. Shows contextual hints based on node type."
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

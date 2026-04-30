import React from "react";
import { Table } from "@arkpad/extension-table";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Table as TableIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function TableDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Table],
    content: "<h1>Table Extension</h1><p>Insert and manage tables with rows and columns.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Table"
      description="Create complex data structures with tables."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton command="insertTable" className="toolbar-btn">
              <TableIcon className="w-4 h-4" />
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

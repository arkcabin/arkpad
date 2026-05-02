import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import {
  Table as TableIcon,
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Trash2,
  TableProperties,
  Combine,
  Split,
  Plus
} from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";
import { StarterKit } from "@arkpad/starter-kit";

export function TableDemo() {
  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: "<h1>Table Extension</h1><p>Insert and manage tables with rows and columns.</p><p>Use the toolbar above to manipulate the table structure.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Table"
      description="Create complex data structures with tables."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col bg-[var(--bg-main)]">
          <div className="h-12 px-3 border-b border-[var(--border)] flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <EditorButton command="insertTable" title="Insert Table" className="toolbar-btn">
              <Plus className="w-3.5 h-3.5" />
              <TableIcon className="w-3.5 h-3.5 ml-0.5" />
            </EditorButton>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton command="addColumnBefore" title="Add Column Before" className="toolbar-btn">
              <BetweenVerticalStart className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton command="addColumnAfter" title="Add Column After" className="toolbar-btn">
              <BetweenVerticalEnd className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton command="deleteColumn" title="Delete Column" className="toolbar-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 className="w-3.5 h-3.5" />
            </EditorButton>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton command="addRowBefore" title="Add Row Before" className="toolbar-btn">
              <BetweenHorizontalStart className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton command="addRowAfter" title="Add Row After" className="toolbar-btn">
              <BetweenHorizontalEnd className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton command="deleteRow" title="Delete Row" className="toolbar-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Trash2 className="w-3.5 h-3.5" />
            </EditorButton>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton command="mergeCells" title="Merge Cells" className="toolbar-btn">
              <Combine className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton command="splitCell" title="Split Cell" className="toolbar-btn">
              <Split className="w-3.5 h-3.5" />
            </EditorButton>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton command="deleteTable" title="Delete Table" className="toolbar-btn text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              <TableProperties className="w-3.5 h-3.5" />
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

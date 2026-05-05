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
  Plus,
  Palette,
} from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";
import { Table } from "@arkpad/extension-table";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { BubbleMenu } from "@arkpad/extension-bubble-menu";
import { TableFloatingToolbar } from "./TableFloatingToolbar";

const complexTableContent = `
<h1>Complex Table Demo</h1>
<p>This demo showcases merged cells, headers, and custom backgrounds.</p>
<div class="tableWrapper">
  <table>
    <colgroup>
      <col style="width: 150px;">
      <col style="width: 150px;">
      <col style="width: 150px;">
    </colgroup>
    <tbody>
      <tr>
        <th colspan="3" style="background-color: #f3f4f6">Project Roadmap 2024</th>
      </tr>
      <tr>
        <th style="background-color: #eff6ff">Phase</th>
        <th style="background-color: #eff6ff">Task</th>
        <th style="background-color: #eff6ff">Status</th>
      </tr>
      <tr>
        <td rowspan="2" style="background-color: #fafafa">Design</td>
        <td>UI Mockups</td>
        <td style="background-color: #dcfce7">Done</td>
      </tr>
      <tr>
        <td>UX Review</td>
        <td style="background-color: #fef9c3">In Progress</td>
      </tr>
      <tr>
        <td style="background-color: #fafafa">Development</td>
        <td>API Integration</td>
        <td style="background-color: #fee2e2">Pending</td>
      </tr>
    </tbody>
  </table>
</div>
<p></p>
`;

export function TableDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Bold,
      Italic,
      Heading,
      Table,
      BubbleMenu.configure({
        shouldShow: ({ editor }) => editor.isActive("table") && editor.isEditable(),
      }),
    ],
    content: complexTableContent,
  });

  if (!editor) return null;

  const setCellColor = (color: string) => {
    editor.runCommand("setCellAttr", "background", color);
  };

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Table"
      description="Create complex data structures with tables."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col bg-[var(--bg-main)] relative">
          <TableFloatingToolbar editor={editor} />
          <div className="h-12 px-3 border-b border-[var(--border)] flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <EditorButton command="insertTable" title="Insert Table" className="toolbar-btn">
              <Plus className="w-3.5 h-3.5" />
              <TableIcon className="w-3.5 h-3.5 ml-0.5" />
            </EditorButton>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton
              command="addColumnBefore"
              title="Add Column Before"
              className="toolbar-btn"
            >
              <BetweenVerticalStart className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton command="addColumnAfter" title="Add Column After" className="toolbar-btn">
              <BetweenVerticalEnd className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton
              command="deleteColumn"
              title="Delete Column"
              className="toolbar-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </EditorButton>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton command="addRowBefore" title="Add Row Before" className="toolbar-btn">
              <BetweenHorizontalStart className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton command="addRowAfter" title="Add Row After" className="toolbar-btn">
              <BetweenHorizontalEnd className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton
              command="deleteRow"
              title="Delete Row"
              className="toolbar-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
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

            <div className="flex items-center gap-0.5 px-1">
              <Palette className="w-3.5 h-3.5 text-[var(--text-muted)] mr-1" />
              {[
                { color: "#eff6ff", label: "Blue" },
                { color: "#dcfce7", label: "Green" },
                { color: "#fee2e2", label: "Red" },
                { color: "#fef9c3", label: "Yellow" },
                { color: null, label: "Clear" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => setCellColor(item.color as string)}
                  title={item.label}
                  className="w-5 h-5 rounded border border-[var(--border)] hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.color || "transparent" }}
                />
              ))}
            </div>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton
              command="deleteTable"
              title="Delete Table"
              className="toolbar-btn text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <TableProperties className="w-3.5 h-3.5" />
            </EditorButton>
          </div>
          <div className="p-12">
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

"use client";

import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { Table } from "@arkpad/extension-table";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
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
import { DemoContainer } from "../components/demos/DemoContainer";

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
    </tbody>
  </table>
</div>
`;

export function TableDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Bold, Italic, Table],
    content: complexTableContent,
  });

  const setCellColor = (color: string) => {
    editor?.runCommand("setCellAttr", "background", color);
  };

  return (
    <DemoContainer editor={editor}>
      <EditorButton
        command="insertTable"
        title="Insert Table"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors flex items-center gap-1"
      >
        <Plus className="w-3.5 h-3.5" />
        <TableIcon className="w-3.5 h-3.5" />
      </EditorButton>
      <div className="w-px h-4 bg-fd-border mx-1" />
      <EditorButton
        command="addColumnBefore"
        title="Add Col Before"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <BetweenVerticalStart className="w-3.5 h-3.5" />
      </EditorButton>
      <EditorButton
        command="addColumnAfter"
        title="Add Col After"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <BetweenVerticalEnd className="w-3.5 h-3.5" />
      </EditorButton>
      <EditorButton
        command="deleteColumn"
        title="Delete Col"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </EditorButton>
      <div className="w-px h-4 bg-fd-border mx-1" />
      <EditorButton
        command="addRowBefore"
        title="Add Row Before"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <BetweenHorizontalStart className="w-3.5 h-3.5" />
      </EditorButton>
      <EditorButton
        command="addRowAfter"
        title="Add Row After"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <BetweenHorizontalEnd className="w-3.5 h-3.5" />
      </EditorButton>
      <EditorButton
        command="deleteRow"
        title="Delete Row"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </EditorButton>
      <div className="w-px h-4 bg-fd-border mx-1" />
      <EditorButton
        command="mergeCells"
        title="Merge"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <Combine className="w-3.5 h-3.5" />
      </EditorButton>
      <EditorButton
        command="splitCell"
        title="Split"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
      >
        <Split className="w-3.5 h-3.5" />
      </EditorButton>
      <div className="w-px h-4 bg-fd-border mx-1" />
      <div className="flex items-center gap-1 px-1">
        <Palette className="w-3.5 h-3.5 text-fd-muted-foreground" />
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
            className="w-5 h-5 rounded border border-fd-border hover:scale-110 transition-transform"
            style={{ backgroundColor: item.color || "transparent" }}
          />
        ))}
      </div>
      <div className="w-px h-4 bg-fd-border mx-1" />
      <EditorButton
        command="deleteTable"
        title="Delete Table"
        className="p-2 rounded hover:bg-fd-accent text-red-500 hover:text-red-600 transition-colors"
      >
        <TableProperties className="w-3.5 h-3.5" />
      </EditorButton>
    </DemoContainer>
  );
}

export const tableCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Table } from "@arkpad/extension-table";
import { Engine } from "@arkpad/core";
import { Table as TableIcon, Plus } from "lucide-react";

export function TableDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Table],
    content: "<table><tr><td>Cell</td></tr></table>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 border-b bg-muted/50">
          <EditorButton command="insertTable">
            <Plus className="w-4 h-4 mr-1" />
            <TableIcon className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-4">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;


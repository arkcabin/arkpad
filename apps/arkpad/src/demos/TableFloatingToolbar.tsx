import React from "react";
import { ArkpadEditorAPI } from "@arkpad/core";
import { useMenuPositioner, EditorButton } from "@arkpad/react";
import {
  Trash2,
  Split,
  Combine,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Minimize2,
} from "lucide-react";

export interface TableFloatingToolbarProps {
  editor: ArkpadEditorAPI | null;
}

/**
 * A context-aware floating toolbar for tables.
 * Uses Glassmorphism design and the high-performance Menu Engine.
 */
export function TableFloatingToolbar({ editor }: TableFloatingToolbarProps) {
  const { style, active } = useMenuPositioner({
    editor,
    extensionName: "bubbleMenu",
    type: "bubble",
    offset: 12,
  });

  if (!active || !editor) return null;

  return (
    <div
      style={style}
      className="flex items-center gap-0.5 p-1 bg-[var(--bg-main)]/80 backdrop-blur-md border border-[var(--border)] rounded-lg shadow-xl ring-1 ring-black/5 z-[1000]"
    >
      <div className="flex items-center border-r border-[var(--border)] pr-1 mr-1">
        <EditorButton
          command="addRowBefore"
          className="p-1.5 hover:bg-[var(--selection)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Add Row Above"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </EditorButton>
        <EditorButton
          command="addRowAfter"
          className="p-1.5 hover:bg-[var(--selection)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Add Row Below"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </EditorButton>
        <EditorButton
          command="deleteRow"
          className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors"
          title="Delete Row"
        >
          <Minimize2 className="w-3.5 h-3.5 rotate-90" />
        </EditorButton>
      </div>

      <div className="flex items-center border-r border-[var(--border)] pr-1 mr-1">
        <EditorButton
          command="addColumnBefore"
          className="p-1.5 hover:bg-[var(--selection)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Add Column Before"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </EditorButton>
        <EditorButton
          command="addColumnAfter"
          className="p-1.5 hover:bg-[var(--selection)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Add Column After"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </EditorButton>
        <EditorButton
          command="deleteColumn"
          className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors"
          title="Delete Column"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </EditorButton>
      </div>

      <div className="flex items-center">
        <EditorButton
          command="mergeCells"
          className="p-1.5 hover:bg-[var(--selection)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Merge Cells"
        >
          <Combine className="w-3.5 h-3.5" />
        </EditorButton>
        <EditorButton
          command="splitCell"
          className="p-1.5 hover:bg-[var(--selection)] rounded text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title="Split Cell"
        >
          <Split className="w-3.5 h-3.5" />
        </EditorButton>
        <EditorButton
          command="deleteTable"
          className="p-1.5 ml-1 hover:bg-red-600 hover:text-white rounded transition-colors"
          title="Delete Table"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </EditorButton>
      </div>
    </div>
  );
}

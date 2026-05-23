import { BubbleMenu, useEditorState, EditorButton } from "@arkpad/react";
import type { ArkpadEditorAPI } from "@arkpad/core";

const MergeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="3" y1="12" x2="21" y2="12" />
  </svg>
);

const SplitIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="3" x2="12" y2="21" />
    <path d="M3 7l4-4 4 4" />
    <path d="M3 17l4 4 4-4" />
    <path d="M21 7l-4-4-4 4" />
    <path d="M21 17l-4 4-4-4" />
  </svg>
);

const RowAddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="9" x2="12" y2="15" />
  </svg>
);

const ColAddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="9" y1="12" x2="15" y2="12" />
  </svg>
);

const RowDeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <polyline points="16,9 12,12 8,9" />
  </svg>
);

const ColDeleteIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="12" y1="3" x2="12" y2="21" />
    <polyline points="9,8 12,12 9,16" />
  </svg>
);

const DeleteTableIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const HeaderIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="12" y1="9" x2="12" y2="21" />
  </svg>
);

function TableToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[var(--menu-bg)] rounded-lg shadow-lg border border-[var(--menu-border)]">
      <EditorButton command="mergeCells" className="toolbar-btn" activeClassName="active" title="Merge Cells">
        <MergeIcon />
      </EditorButton>
      <EditorButton command="splitCell" className="toolbar-btn" activeClassName="active" title="Split Cell">
        <SplitIcon />
      </EditorButton>
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      <EditorButton command="addRowAfter" className="toolbar-btn" activeClassName="active" title="Add Row">
        <RowAddIcon />
      </EditorButton>
      <EditorButton command="addColumnAfter" className="toolbar-btn" activeClassName="active" title="Add Column">
        <ColAddIcon />
      </EditorButton>
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      <EditorButton command="deleteRow" className="toolbar-btn" activeClassName="active" title="Delete Row">
        <RowDeleteIcon />
      </EditorButton>
      <EditorButton command="deleteColumn" className="toolbar-btn" activeClassName="active" title="Delete Column">
        <ColDeleteIcon />
      </EditorButton>
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      <EditorButton command="deleteTable" className="toolbar-btn" activeClassName="active" title="Delete Table">
        <DeleteTableIcon />
      </EditorButton>
      <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
      <EditorButton command="toggleHeaderRow" className="toolbar-btn" activeClassName="active" title="Toggle Header">
        <HeaderIcon />
      </EditorButton>
    </div>
  );
}

function FormatToolbar() {
  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[var(--menu-bg)] rounded-lg shadow-lg border border-[var(--menu-border)]">
      <EditorButton command="toggleBold" name="bold" className="toolbar-btn" activeClassName="active" title="Bold">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </EditorButton>
      <EditorButton command="toggleItalic" name="italic" className="toolbar-btn" activeClassName="active" title="Italic">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" x2="10" y1="4" y2="4" />
          <line x1="14" x2="5" y1="20" y2="20" />
          <line x1="15" x2="9" y1="4" y2="20" />
        </svg>
      </EditorButton>
      <EditorButton command="toggleUnderline" name="underline" className="toolbar-btn" activeClassName="active" title="Underline">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4v6a6 6 0 0 0 12 0V4" />
          <line x1="4" x2="20" y1="20" y2="20" />
        </svg>
      </EditorButton>
    </div>
  );
}

export function EditorBubbleMenu({ editor }: { editor: ArkpadEditorAPI }) {
  const isTable = useEditorState(editor, (e) => e.isActive("table"));

  return (
    <BubbleMenu editor={editor}>
      {isTable ? <TableToolbar /> : <FormatToolbar />}
    </BubbleMenu>
  );
}

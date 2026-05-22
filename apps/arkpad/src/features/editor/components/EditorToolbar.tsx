import React from "react";
import { useArkpadContext, useEditorState } from "@arkpad/react";
import { EditorButton } from "@arkpad/react";
import type { ArkpadEditorAPI } from "@arkpad/core";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  Superscript,
  Subscript,
  Highlighter,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Youtube,
  Image,
  Pilcrow,
  Table,
  TableRowsSplit,
  TableColumnsSplit,
  Trash2,
  RowsIcon,
} from "lucide-react";

function Sep() {
  return <span className="toolbar-divider" />;
}

function YoutubeButton() {
  const editor = useArkpadContext();
  return (
    <button
      type="button"
      className="tool-button"
      title="Insert YouTube video"
      onClick={() => {
        const url = prompt("YouTube URL:");
        if (url && editor) editor.runCommand("setYoutubeVideo", { src: url });
      }}
    >
      <Youtube className="tool-icon" />
    </button>
  );
}

function ImageButton() {
  const editor = useArkpadContext();
  return (
    <button
      type="button"
      className="tool-button"
      title="Insert image"
      onClick={() => {
        const url = prompt("Image URL:");
        if (url && editor) editor.runCommand("setImage", { src: url });
      }}
    >
      <Image className="tool-icon" />
    </button>
  );
}

function FontFamilySelect() {
  const editor = useArkpadContext();
  const fonts = [
    { label: "Default", value: "" },
    { label: "Serif", value: "Georgia, serif" },
    { label: "Sans", value: "Inter, sans-serif" },
    { label: "Mono", value: "'Courier New', monospace" },
  ];
  return (
    <select
      className="tool-select"
      title="Font family"
      defaultValue=""
      onChange={(e) => {
        if (!editor) return;
        if (e.target.value) editor.runCommand("setFontFamily", e.target.value);
        else editor.runCommand("unsetFontFamily");
      }}
    >
      {fonts.map((f) => (
        <option key={f.value} value={f.value}>
          {f.label}
        </option>
      ))}
    </select>
  );
}

function FontSizeSelect() {
  const editor = useArkpadContext();
  const sizes = ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"];
  return (
    <select
      className="tool-select tool-select-sm"
      title="Font size"
      defaultValue="16px"
      onChange={(e) => {
        if (!editor) return;
        if (e.target.value) editor.runCommand("setFontSize", e.target.value);
        else editor.runCommand("unsetFontSize");
      }}
    >
      {sizes.map((s) => (
        <option key={s} value={s}>
          {s.replace("px", "")}
        </option>
      ))}
    </select>
  );
}

function HighlightButton() {
  const editor = useArkpadContext();
  const [color, setColor] = React.useState("#fef08a");
  return (
    <span className="tool-color-wrap" title="Highlight color">
      <button
        type="button"
        className="tool-button"
        onClick={() => editor?.runCommand("toggleHighlight", { color })}
      >
        <Highlighter className="tool-icon" />
      </button>
      <input
        type="color"
        className="tool-color-input"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="Pick highlight color"
      />
    </span>
  );
}

function TextColorButton() {
  const editor = useArkpadContext();
  const [color, setColor] = React.useState("#ef4444");
  return (
    <span className="tool-color-wrap" title="Text color">
      <button
        type="button"
        className="tool-button"
        onClick={() => editor?.runCommand("setColor", color)}
        style={{ borderBottom: `3px solid ${color}` }}
      >
        <span style={{ fontSize: "13px", fontWeight: 700, lineHeight: 1 }}>A</span>
      </button>
      <input
        type="color"
        className="tool-color-input"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        title="Pick text color"
      />
    </span>
  );
}

function TableButton() {
  const editor = useArkpadContext();
  return (
    <button
      type="button"
      className="tool-button"
      title="Insert table"
      onClick={() => {
        if (!editor) return;
        editor.runCommand("insertTable", { rows: 3, cols: 3, withHeaderRow: true });
      }}
    >
      <Table className="tool-icon" />
    </button>
  );
}

function TableContextControls() {
  const editor = useArkpadContext();
  const selectInTable = React.useCallback((s: ArkpadEditorAPI) => s.isActive("table"), []);
  const inTable = useEditorState(editor, selectInTable);

  if (!inTable) return null;

  return (
    <>
      <Sep />
      <button
        type="button"
        className="tool-button"
        title="Add row before"
        onClick={() => editor?.runCommand("addRowBefore")}
      >
        <RowsIcon className="tool-icon" style={{ transform: "rotate(180deg)" }} />
      </button>
      <button
        type="button"
        className="tool-button"
        title="Add row after"
        onClick={() => editor?.runCommand("addRowAfter")}
      >
        <RowsIcon className="tool-icon" />
      </button>
      <button
        type="button"
        className="tool-button"
        title="Delete row"
        onClick={() => editor?.runCommand("deleteRow")}
      >
        <TableRowsSplit className="tool-icon" />
      </button>
      <Sep />
      <button
        type="button"
        className="tool-button"
        title="Add column before"
        onClick={() => editor?.runCommand("addColumnBefore")}
      >
        <TableColumnsSplit className="tool-icon" style={{ transform: "rotate(90deg)" }} />
      </button>
      <button
        type="button"
        className="tool-button"
        title="Add column after"
        onClick={() => editor?.runCommand("addColumnAfter")}
      >
        <TableColumnsSplit className="tool-icon" style={{ transform: "rotate(-90deg)" }} />
      </button>
      <button
        type="button"
        className="tool-button"
        title="Delete column"
        onClick={() => editor?.runCommand("deleteColumn")}
      >
        <TableColumnsSplit className="tool-icon" />
      </button>
      <Sep />
      <button
        type="button"
        className="tool-button"
        title="Delete table"
        onClick={() => editor?.runCommand("deleteTable")}
      >
        <Trash2 className="tool-icon" />
      </button>
    </>
  );
}

export function EditorToolbar() {
  return (
    <div className="toolbar">
      {/* History */}
      <EditorButton command="undo" className="tool-button" title="Undo (Ctrl+Z)">
        <Undo2 className="tool-icon" />
      </EditorButton>
      <EditorButton command="redo" className="tool-button" title="Redo (Ctrl+Y)">
        <Redo2 className="tool-icon" />
      </EditorButton>

      <Sep />

      {/* Font */}
      <FontFamilySelect />
      <FontSizeSelect />

      <Sep />

      {/* Marks */}
      <EditorButton command="toggleBold" name="bold" className="tool-button" activeClassName="active" title="Bold (Ctrl+B)">
        <Bold className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleItalic" name="italic" className="tool-button" activeClassName="active" title="Italic (Ctrl+I)">
        <Italic className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleUnderline" name="underline" className="tool-button" activeClassName="active" title="Underline (Ctrl+U)">
        <Underline className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleStrike" name="strike" className="tool-button" activeClassName="active" title="Strikethrough">
        <Strikethrough className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleCode" name="code" className="tool-button" activeClassName="active" title="Inline code">
        <Code className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleSuperscript" name="superscript" className="tool-button" activeClassName="active" title="Superscript">
        <Superscript className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleSubscript" name="subscript" className="tool-button" activeClassName="active" title="Subscript">
        <Subscript className="tool-icon" />
      </EditorButton>

      <Sep />

      {/* Color */}
      <TextColorButton />
      <HighlightButton />

      <Sep />

      {/* Block type */}
      <EditorButton command="setParagraph" name="paragraph" className="tool-button" activeClassName="active" title="Paragraph">
        <Pilcrow className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleHeading" args={[{ level: 1 }]} name="heading" attrs={{ level: 1 }} className="tool-button" activeClassName="active" title="Heading 1">
        <Heading1 className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleHeading" args={[{ level: 2 }]} name="heading" attrs={{ level: 2 }} className="tool-button" activeClassName="active" title="Heading 2">
        <Heading2 className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleHeading" args={[{ level: 3 }]} name="heading" attrs={{ level: 3 }} className="tool-button" activeClassName="active" title="Heading 3">
        <Heading3 className="tool-icon" />
      </EditorButton>

      <Sep />

      {/* Alignment */}
      <EditorButton command="setTextAlign" args={["left"]} className="tool-button" activeClassName="active" title="Align left">
        <AlignLeft className="tool-icon" />
      </EditorButton>
      <EditorButton command="setTextAlign" args={["center"]} className="tool-button" activeClassName="active" title="Align center">
        <AlignCenter className="tool-icon" />
      </EditorButton>
      <EditorButton command="setTextAlign" args={["right"]} className="tool-button" activeClassName="active" title="Align right">
        <AlignRight className="tool-icon" />
      </EditorButton>
      <EditorButton command="setTextAlign" args={["justify"]} className="tool-button" activeClassName="active" title="Justify">
        <AlignJustify className="tool-icon" />
      </EditorButton>

      <Sep />

      {/* Lists */}
      <EditorButton command="toggleBulletList" name="bulletList" className="tool-button" activeClassName="active" title="Bullet list">
        <List className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleOrderedList" name="orderedList" className="tool-button" activeClassName="active" title="Ordered list">
        <ListOrdered className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleTaskList" name="taskList" className="tool-button" activeClassName="active" title="Task list">
        <ListTodo className="tool-icon" />
      </EditorButton>

      <Sep />

      {/* Block elements */}
      <EditorButton command="toggleBlockquote" name="blockquote" className="tool-button" activeClassName="active" title="Blockquote">
        <Quote className="tool-icon" />
      </EditorButton>
      <EditorButton command="toggleCodeBlock" name="codeBlock" className="tool-button" activeClassName="active" title="Code block">
        <Code className="tool-icon" />
      </EditorButton>
      <EditorButton command="setHorizontalRule" className="tool-button" title="Horizontal rule">
        <Minus className="tool-icon" />
      </EditorButton>

      <Sep />

      {/* Insert */}
      <ImageButton />
      <YoutubeButton />
      <TableButton />
      <TableContextControls />
    </div>
  );
}

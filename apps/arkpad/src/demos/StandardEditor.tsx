import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";
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
  Quote,
  Minus,
  Table as TableIcon,
  Undo,
  Redo,
  Link,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Eraser,
  CheckSquare,
  Superscript,
  Subscript,
  Code2,
} from "lucide-react";

function ToolbarButton({
  command,
  name,
  children,
  title,
}: {
  command: string;
  name?: string;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <EditorButton
      command={command}
      name={name}
      title={title}
      className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed [&.active]:bg-blue-50 [&.active]:text-blue-600"
      activeClassName="active"
    >
      {children}
    </EditorButton>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-gray-200 mx-1" />;
}

export function StandardEditor() {
  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: `
      <h1>Clean Rich Text Editor</h1>
      <p>This project has been pruned of all "Page Builder" architecture. You are now working with a high-performance, standard document editor.</p>
      <ul>
        <li>Standard Paragraphs & Headings</li>
        <li>Tables & Lists</li>
        <li>Markdown Support</li>
        <li>Pruned "Studio" logic</li>
      </ul>
    `,
    editable: true,
    autofocus: true,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50/50">
        {/* Full Toolbar */}
        <div className="sticky top-0 z-10 w-full bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {/* History */}
            <ToolbarButton command="undo" title="Undo">
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="redo" title="Redo">
              <Redo className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton command="toggleHeading" name="h1" title="Heading 1">
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleHeading" name="h2" title="Heading 2">
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleHeading" name="h3" title="Heading 3">
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="setParagraph" title="Paragraph">
              <Type className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Marks */}
            <ToolbarButton command="toggleBold" name="strong" title="Bold">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleItalic" name="em" title="Italic">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleUnderline" name="underline" title="Underline">
              <Underline className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleStrike" name="strike" title="Strike">
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleCode" name="code" title="Inline Code">
              <Code className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton command="setTextAlign" name="left" title="Align Left">
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="setTextAlign" name="center" title="Align Center">
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="setTextAlign" name="right" title="Align Right">
              <AlignRight className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Blocks */}
            <ToolbarButton command="toggleBulletList" name="bulletList" title="Bullet List">
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleOrderedList" name="orderedList" title="Ordered List">
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleTaskList" name="taskList" title="Task List">
              <CheckSquare className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleBlockquote" name="blockquote" title="Blockquote">
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleCodeBlock" name="code_block" title="Code Block">
              <Code2 className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Advanced */}
            <ToolbarButton command="toggleSuperscript" name="superscript" title="Superscript">
              <Superscript className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleSubscript" name="subscript" title="Subscript">
              <Subscript className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="setHighlighter" title="Highlight">
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="setEraser" title="Eraser">
              <Eraser className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Insert */}
            <ToolbarButton command="toggleLink" name="link" title="Link">
              <Link className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="insertHorizontalRule" title="Horizontal Rule">
              <Minus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="insertTable" title="Insert Table">
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 shadow-sm min-h-[calc(100vh-12rem)]">
            <div className="p-8 sm:p-12">
              <ArkpadEditorContent
                editor={editor}
                className="prose dark:prose-invert max-w-none focus:outline-none arkpad-editor"
              />
            </div>
          </div>
        </div>
      </div>
    </ArkpadProvider>
  );
}

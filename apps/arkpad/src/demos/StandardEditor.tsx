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

// Custom SVG Icons for H4, H5, H6 to match Lucide style
const Heading4 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 10l3 5v2h-3" />
    <path d="M21 15h-4" />
  </svg>
);

const Heading5 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 13v-3h4" />
    <path d="M17 17a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3" />
  </svg>
);

const Heading6 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <circle cx="19" cy="16" r="3" />
    <path d="M22 13a3 3 0 0 0-3-3 3 3 0 0 0-3 3" />
  </svg>
);

function ToolbarButton({
  command,
  args,
  name,
  attrs,
  children,
  title,
}: {
  command: string;
  args?: any[];
  name?: string;
  attrs?: Record<string, any>;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <EditorButton
      command={command}
      args={args}
      name={name}
      attrs={attrs}
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
        <li>Standard Paragraphs & Headings (H1-H6)</li>
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
      <div className="flex-1 flex flex-col min-h-screen bg-[var(--bg-canvas)]">
        {/* Full Toolbar */}
        <div className="sticky top-0 z-10 w-full bg-[var(--bg-editor)] border-b border-[var(--border)] shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {/* History */}
            <ToolbarButton command="undo" title="Undo">
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="redo" title="Redo">
              <Redo className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton
              command="toggleHeading"
              args={[{ level: 1 }]}
              name="h1"
              attrs={{ level: 1 }}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              command="toggleHeading"
              args={[{ level: 2 }]}
              name="h2"
              attrs={{ level: 2 }}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              command="toggleHeading"
              args={[{ level: 3 }]}
              name="h3"
              attrs={{ level: 3 }}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              command="toggleHeading"
              args={[{ level: 4 }]}
              name="h4"
              attrs={{ level: 4 }}
              title="Heading 4"
            >
              <Heading4 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              command="toggleHeading"
              args={[{ level: 5 }]}
              name="h5"
              attrs={{ level: 5 }}
              title="Heading 5"
            >
              <Heading5 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              command="toggleHeading"
              args={[{ level: 6 }]}
              name="h6"
              attrs={{ level: 6 }}
              title="Heading 6"
            >
              <Heading6 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="setParagraph" name="paragraph" title="Paragraph">
              <Type className="w-4 h-4" />
            </ToolbarButton>

            <Divider />

            {/* Marks */}
            <ToolbarButton command="toggleBold" name="bold" title="Bold">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="toggleItalic" name="italic" title="Italic">
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
            <ToolbarButton
              command="setTextAlign"
              args={["left"]}
              name="textAlign"
              attrs={{ align: "left" }}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              command="setTextAlign"
              args={["center"]}
              name="textAlign"
              attrs={{ align: "center" }}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              command="setTextAlign"
              args={["right"]}
              name="textAlign"
              attrs={{ align: "right" }}
              title="Align Right"
            >
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
            <ToolbarButton command="toggleCodeBlock" name="codeBlock" title="Code Block">
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
            <ToolbarButton command="setHighlighter" name="highlighter" title="Highlight">
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
            <ToolbarButton
              command="insertHorizontalRule"
              name="horizontalRule"
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton command="insertTable" name="table" title="Insert Table">
              <TableIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-4xl mx-auto bg-[var(--bg-editor)] border border-[var(--border)] shadow-sm min-h-[calc(100vh-12rem)]">
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

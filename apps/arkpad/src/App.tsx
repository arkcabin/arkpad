import React, { useState, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Terminal,
  Quote,
  Minus,
  Image as ImageIcon,
  Undo2,
  Redo2,
  CheckSquare,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  Sun,
  Moon,
  Highlighter,
  Eraser,
} from "lucide-react";

import { 
  useArkpadEditor, 
  ArkpadEditorContent, 
  BubbleMenu, 
  FloatingMenu,
  useEditorState 
} from "@arkpad/react";
import type { ArkpadEditorAPI } from "@arkpad/core";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ onClick, isActive, disabled, children, title }, ref) => (
    <button
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-btn ${isActive ? "active" : ""}`}
    >
      {children}
    </button>
  )
);

/**
 * A highly optimized button that only re-renders when its specific editor state changes.
 */
function MenuButton({ 
  editor, 
  command, 
  name, 
  attrs, 
  children, 
  title 
}: { 
  editor: ArkpadEditorAPI; 
  command: string; 
  name: string; 
  attrs?: any;
  children: React.ReactNode;
  title?: string;
}) {
  const active = useEditorState(editor, (s) => s.isActive(name, attrs));
  const disabled = useEditorState(editor, (s) => !s.canRunCommand(command, attrs));
  
  return (
    <ToolbarButton
      onClick={() => editor.runCommand(command, attrs)}
      isActive={!!active}
      disabled={disabled ?? false}
      title={title}
    >
      {children}
    </ToolbarButton>
  );
}

const ToolbarSeparator = () => <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />;

export function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("arkpad-theme");
      return (
        saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
      );
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("arkpad-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("arkpad-theme", "light");
    }
  }, [isDark]);

  const editor = useArkpadEditor({
    content:
      "<h1>Complete Toolbar Refactor</h1><p>Every single core extension is now represented here. <strong>Bold</strong>, <em>Italic</em>, <mark>Highlight</mark>, and even <sup>Superscript</sup> are all live. Check out the <code>alignment</code> and <code>list</code> controls too!</p>",
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] py-8 md:py-12 px-4 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto">
        <div className="editor-wrapper border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          {/* Toolbar */}
          <div className="toolbar-wrapper">
            <div className="toolbar-group">
              <MenuButton editor={editor} command="toggleBold" name="strong" title="Bold">
                <Bold className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleItalic" name="em" title="Italic">
                <Italic className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleUnderline" name="underline" title="Underline">
                <Underline className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleStrike" name="strike" title="Strikethrough">
                <Strikethrough className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleHighlight" name="highlight" title="Highlight">
                <Highlighter className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleCode" name="code" title="Inline Code">
                <Code className="w-4 h-4" />
              </MenuButton>
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Enter URL:", "https://");
                  if (url) editor.runCommand("toggleLink", url);
                }}
                isActive={editor.isActive("link")}
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("unsetAllMarks")} title="Clear Formatting">
                <Eraser className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <MenuButton editor={editor} command="toggleSuperscript" name="superscript" title="Superscript">
                <SuperscriptIcon className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleSubscript" name="subscript" title="Subscript">
                <SubscriptIcon className="w-4 h-4" />
              </MenuButton>
            </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <MenuButton editor={editor} command="toggleHeading" attrs={{ level: 1 }} name="heading" title="H1">
                <Heading1 className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleHeading" attrs={{ level: 2 }} name="heading" title="H2">
                <Heading2 className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleHeading" attrs={{ level: 3 }} name="heading" title="H3">
                <Heading3 className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleBlockquote" name="blockquote" title="Blockquote">
                <Quote className="w-4 h-4" />
              </MenuButton>
            </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <MenuButton editor={editor} command="toggleBulletList" name="bulletList" title="Bullet List">
                <List className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleOrderedList" name="orderedList" title="Ordered List">
                <ListOrdered className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleTaskList" name="taskList" title="Task List">
                <CheckSquare className="w-4 h-4" />
              </MenuButton>
            </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton onClick={() => editor.runCommand("indentList")} title="Indent">
                <Indent className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("outdentList")} title="Outdent">
                <Outdent className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <MenuButton editor={editor} command="setTextAlign" attrs={{ align: "left" }} name="textAlign" title="Align Left">
                <AlignLeft className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="setTextAlign" attrs={{ align: "center" }} name="textAlign" title="Align Center">
                <AlignCenter className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="setTextAlign" attrs={{ align: "right" }} name="textAlign" title="Align Right">
                <AlignRight className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="setTextAlign" attrs={{ align: "justify" }} name="textAlign" title="Justify">
                <AlignJustify className="w-4 h-4" />
              </MenuButton>
            </div>

            <div className="flex-grow" />

            <div className="toolbar-group">
              <ToolbarButton onClick={() => editor.runCommand("toggleCodeBlock")} title="Code Block">
                <Terminal className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("setHorizontalRule")} title="Horizontal Rule">
                <Minus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => {
                const url = window.prompt("Image URL:", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800");
                if (url) editor.runCommand("setImage", { src: url });
              }} title="Insert Image">
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => editor.runCommand("undo")} title="Undo">
                <Undo2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("redo")} title="Redo">
                <Redo2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton onClick={() => setIsDark(!isDark)} title="Toggle Theme">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </ToolbarButton>
            </div>
          </div>

          {/* Editor Body */}
          <div className="editor-body">
            <ArkpadEditorContent editor={editor} className="arkpad-container" />
          </div>

          <BubbleMenu editor={editor}>
            <div className="bubble-menu shadow-2xl border-slate-200/50 dark:border-slate-800/50">
              <MenuButton editor={editor} command="toggleBold" name="strong">
                <Bold className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleItalic" name="em">
                <Italic className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleHighlight" name="highlight">
                <Highlighter className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleCode" name="code">
                <Code className="w-4 h-4" />
              </MenuButton>
            </div>
          </BubbleMenu>

          <FloatingMenu editor={editor}>
            <div className="floating-menu shadow-2xl border-slate-200/50 dark:border-slate-800/50">
              <MenuButton editor={editor} command="toggleHeading" attrs={{ level: 1 }} name="heading">
                <Heading1 className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleHeading" attrs={{ level: 2 }} name="heading">
                <Heading2 className="w-4 h-4" />
              </MenuButton>
              <ToolbarButton onClick={() => editor.runCommand("toggleBulletList")}>
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("toggleTaskList")}>
                <CheckSquare className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </FloatingMenu>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold px-2">
          <div className="flex gap-6">
            <span>{editor.getText().length} chars</span>
            <span>{editor.getText().split(/\s+/).filter(Boolean).length} words</span>
            <span className="text-brand opacity-60">Arkpad Core v1.6.3</span>
          </div>
          <div className="flex gap-4">
            <span>Built for Agentic Workflows</span>
            <span>Refreshed 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

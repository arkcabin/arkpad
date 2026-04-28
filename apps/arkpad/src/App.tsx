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
  Superscript,
  Subscript,
  Sun,
  Moon,
  Plus,
  ChevronDown,
  Highlighter,
} from "lucide-react";

import { useArkpadEditor, ArkpadEditorContent, BubbleMenu, FloatingMenu } from "@arkpad/react";

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
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-btn ${isActive ? "active" : ""}`}
    >
      {children}
    </button>
  )
);

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

  // THE NEW CLEAN API: Simple, Declarative, and Auto-Reactive
  const editor = useArkpadEditor({
    content:
      "<p>Welcome to <strong>Test</strong> — now with the simplest API ever.</p><p>We have introduced the <code>useArkpadEditor</code> hook to make your life easy.</p>",
  });

  if (!editor) {
    return null;
  }

  const run = (command: string, value?: any) => editor.runCommand(command, value);
  const isActive = (name: string, attrs?: Record<string, any>) => editor.isActive(name, attrs);

  const canUndo = editor.canRunCommand("undo");
  const canRedo = editor.canRunCommand("redo");

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] py-8 md:py-12 px-4 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto">
        <div className="editor-wrapper border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          {/* Toolbar */}
          <div className="toolbar-wrapper">
            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => run("toggleBold")}
                isActive={isActive("strong")}
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleItalic")}
                isActive={isActive("em")}
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleUnderline")}
                isActive={isActive("underline")}
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleStrike")}
                isActive={isActive("strike")}
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleCode")}
                isActive={isActive("code")}
                title="Inline Code"
              >
                <Code className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Enter URL:", "https://");
                  if (url) {
                    editor.runCommand("toggleLink", url);
                  }
                }}
                isActive={isActive("link")}
                title="Link"
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => run("toggleHighlight")}
                isActive={isActive("highlight")}
                title="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </ToolbarButton>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => run("toggleSuperscript")}
                isActive={isActive("superscript")}
                title="Superscript"
              >
                <Superscript className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleSubscript")}
                isActive={isActive("subscript")}
                title="Subscript"
              >
                <Subscript className="w-4 h-4" />
              </ToolbarButton>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => run("toggleHeading", { level: 1 })}
                isActive={isActive("heading", { level: 1 })}
                title="H1"
              >
                <div className="flex items-center gap-0.5">
                  <span className="text-xs font-bold">H</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </div>
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleHeading", { level: 2 })}
                isActive={isActive("heading", { level: 2 })}
                title="H2"
              >
                <Heading2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleHeading", { level: 3 })}
                isActive={isActive("heading", { level: 3 })}
                title="H3"
              >
                <Heading3 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleHeading", { level: 4 })}
                isActive={isActive("heading", { level: 4 })}
                title="H4"
              >
                <span className="text-xs font-bold">H4</span>
              </ToolbarButton>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <button className="inline-flex items-center gap-1 px-3 h-8 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => run("setTextAlignLeft")}
                isActive={isActive("paragraph", { align: "left" })}
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("setTextAlignCenter")}
                isActive={isActive("paragraph", { align: "center" })}
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("setTextAlignRight")}
                isActive={isActive("paragraph", { align: "right" })}
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("setTextAlignJustify")}
                isActive={isActive("paragraph", { align: "justify" })}
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </ToolbarButton>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => run("toggleBlockquote")}
                isActive={isActive("blockquote")}
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleCodeBlock")}
                isActive={isActive("codeBlock")}
                title="Code Block"
              >
                <Terminal className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => run("setHorizontalRule")} title="Horizontal Rule">
                <Minus className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("setImage", "https://picsum.photos/1200/600")}
                title="Insert Image"
              >
                <ImageIcon className="w-4 h-4" />
              </ToolbarButton>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => run("toggleBulletList")}
                isActive={isActive("bulletList")}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleOrderedList")}
                isActive={isActive("orderedList")}
                title="Ordered List"
              >
                <ListOrdered className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("toggleTaskList")}
                isActive={isActive("taskList")}
                title="Task List"
              >
                <CheckSquare className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("indentList")}
                isActive={false}
                title="Indent (Tab)"
              >
                <Indent className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => run("outdentList")}
                isActive={false}
                title="Outdent (Shift+Tab)"
              >
                <Outdent className="w-4 h-4" />
              </ToolbarButton>
          </div>

            <div className="flex-1 min-w-4" />

            <div className="toolbar-group">
              <ToolbarButton onClick={() => run("undo")} disabled={!canUndo} title="Undo">
                <Undo2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => run("redo")} disabled={!canRedo} title="Redo">
                <Redo2 className="w-4 h-4" />
              </ToolbarButton>
          </div>

            <ToolbarSeparator />

            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => setIsDark(!isDark)}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 stroke-[1.5]" />
                ) : (
                  <Moon className="w-4 h-4 stroke-[1.5]" />
                )}
              </ToolbarButton>
          </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-10 md:p-24 min-h-[700px] relative transition-all duration-300">
            <div className="max-w-3xl mx-auto">
              <BubbleMenu editor={editor}>
                <div className="flex items-center gap-1 bg-slate-900 text-white p-1.5 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => run("toggleHighlight")}
                    className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive("highlight") ? "text-yellow-400 bg-white/5" : "text-slate-300"}`}
                  >
                    <Highlighter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => run("toggleBold")}
                    className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive("strong") ? "text-blue-400 bg-white/5" : "text-slate-300"}`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => run("toggleItalic")}
                    className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive("em") ? "text-blue-400 bg-white/5" : "text-slate-300"}`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => run("toggleSuperscript")}
                    className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive("superscript") ? "text-blue-400 bg-white/5" : "text-slate-300"}`}
                  >
                    <Superscript className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => run("toggleSubscript")}
                    className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive("subscript") ? "text-blue-400 bg-white/5" : "text-slate-300"}`}
                  >
                    <Subscript className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button
                    onClick={() => run("toggleLink", "https://")}
                    className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive("link") ? "text-blue-400 bg-white/5" : "text-slate-300"}`}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </button>
                </div>
              </BubbleMenu>

              <FloatingMenu editor={editor}>
                <div className="flex items-center bg-white rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-slate-200 p-1 animate-in fade-in slide-in-from-left-4 duration-300">
                  <button
                    onClick={() => run("toggleHeading", { level: 1 })}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => run("toggleBulletList")}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </FloatingMenu>

              {/* THE NEW CLEAN MOUNT COMPONENT */}
              <ArkpadEditorContent editor={editor} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-8 py-3 bg-white rounded-full shadow-sm border border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Hook Enabled
            </span>
            <span>&bull;</span>
            <span>ProseMirror Core</span>
          </div>
          <div className="flex items-center gap-4">
            <span>{editor.getHTML().length} Characters</span>
          </div>
        </div>
      </div>
    </div>
  );
}

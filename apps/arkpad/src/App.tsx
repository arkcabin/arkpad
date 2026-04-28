import React, { useState, useEffect, useRef } from "react";
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
  Search,
  Replace,
  MousePointer2,
  Lock,
  Unlock,
  Plus,
} from "lucide-react";

import {
  useArkpadEditor,
  ArkpadEditorContent,
  BubbleMenu,
  FloatingMenu,
  useEditorState,
} from "@arkpad/react";
import type { ArkpadEditorAPI } from "@arkpad/core";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  variant?: "default" | "danger" | "success" | "brand";
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ onClick, isActive, disabled, children, title, variant = "default" }, ref) => (
    <button
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-btn ${isActive ? "active" : ""} variant-${variant}`}
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
  title,
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

const ToolbarSeparator = () => (
  <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 opacity-50" />
);

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

  const [isLocked, setIsLocked] = useState(false);
  const isLockedRef = useRef(isLocked);

  // Keep ref in sync
  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

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
      "<h1>The Ultimate Arkpad UI</h1><p>Every single core feature is now active. From <strong>Formatting</strong> and <strong>Lists</strong> to <strong>Master APIs</strong> like Search/Replace and Middleware Interceptors. Try it all!</p>",
    onInterceptor: () => {
      if (isLockedRef.current) {
        console.warn("Arkpad: Transaction blocked by Interceptor Middleware.");
        return false;
      }
      return true;
    },
    onSelectionUpdate: ({ coords }) => {
      console.log("Selection moved to:", coords);
    },
    onPaste: ({ event }) => {
      console.log("Content pasted:", event.clipboardData?.getData("text/plain"));
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] py-8 md:py-12 px-4 transition-colors duration-300">
      <div className="max-w-[1300px] mx-auto">
        <div className="editor-wrapper border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
          {/* Main Toolbar */}
          <div className="toolbar-wrapper flex-wrap gap-y-2 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
            {/* Formatting Group */}
            <div className="toolbar-group">
              <MenuButton editor={editor} command="toggleBold" name="strong" title="Bold">
                <Bold className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleItalic" name="em" title="Italic">
                <Italic className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleUnderline"
                name="underline"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleStrike"
                name="strike"
                title="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleHighlight"
                name="highlight"
                title="Highlight"
              >
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
              <MenuButton
                editor={editor}
                command="toggleSuperscript"
                name="superscript"
                title="Superscript"
              >
                <SuperscriptIcon className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleSubscript"
                name="subscript"
                title="Subscript"
              >
                <SubscriptIcon className="w-4 h-4" />
              </MenuButton>
              <ToolbarButton
                onClick={() => editor.runCommand("unsetAllMarks")}
                title="Clear Formatting"
              >
                <Eraser className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <ToolbarSeparator />

            {/* Structure Group */}
            <div className="toolbar-group">
              <MenuButton
                editor={editor}
                command="toggleHeading"
                attrs={{ level: 1 }}
                name="heading"
                title="H1"
              >
                <Heading1 className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleHeading"
                attrs={{ level: 2 }}
                name="heading"
                title="H2"
              >
                <Heading2 className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleHeading"
                attrs={{ level: 3 }}
                name="heading"
                title="H3"
              >
                <Heading3 className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleBlockquote"
                name="blockquote"
                title="Blockquote"
              >
                <Quote className="w-4 h-4" />
              </MenuButton>
              <ToolbarButton
                onClick={() => editor.runCommand("toggleCodeBlock")}
                title="Code Block"
              >
                <Terminal className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.runCommand("setHorizontalRule")}
                title="Horizontal Rule"
              >
                <Minus className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <ToolbarSeparator />

            {/* List Group */}
            <div className="toolbar-group">
              <MenuButton
                editor={editor}
                command="toggleBulletList"
                name="bulletList"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleOrderedList"
                name="orderedList"
                title="Ordered List"
              >
                <ListOrdered className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="toggleTaskList"
                name="taskList"
                title="Task List"
              >
                <CheckSquare className="w-4 h-4" />
              </MenuButton>
              <ToolbarButton onClick={() => editor.runCommand("indentList")} title="Indent">
                <Indent className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("outdentList")} title="Outdent">
                <Outdent className="w-4 h-4" />
              </ToolbarButton>
            </div>

            <ToolbarSeparator />

            {/* Alignment Group */}
            <div className="toolbar-group">
              <MenuButton
                editor={editor}
                command="setTextAlign"
                attrs={{ align: "left" }}
                name="textAlign"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="setTextAlign"
                attrs={{ align: "center" }}
                name="textAlign"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="setTextAlign"
                attrs={{ align: "right" }}
                name="textAlign"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </MenuButton>
              <MenuButton
                editor={editor}
                command="setTextAlign"
                attrs={{ align: "justify" }}
                name="textAlign"
                title="Justify"
              >
                <AlignJustify className="w-4 h-4" />
              </MenuButton>
            </div>

            <ToolbarSeparator />

            {/* Master API Tools */}
            <div className="toolbar-group bg-brand/5 dark:bg-brand/10 p-1 rounded-md border border-brand/20">
              <ToolbarButton
                onClick={() => {
                  const query = window.prompt("Search for:");
                  if (query) {
                    const results = editor.search(query);
                    alert(`Found ${results.length} matches.`);
                    const firstMatch = results[0];
                    if (firstMatch)
                      editor.setSelection({ from: firstMatch.from, to: firstMatch.to });
                  }
                }}
                title="Search Document"
                variant="brand"
              >
                <Search className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  const query = window.prompt("Replace word:");
                  const replacement = window.prompt("With:");
                  if (query && replacement) editor.replace(query, replacement);
                }}
                title="Search & Replace"
                variant="brand"
              >
                <Replace className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.selectAll()}
                title="Select Everything"
                variant="brand"
              >
                <MousePointer2 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => setIsLocked(!isLocked)}
                isActive={isLocked}
                title={isLocked ? "Unlock Editor Actions" : "Lock Editor Actions (Middleware)"}
                variant={isLocked ? "danger" : "success"}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </ToolbarButton>
              <ToolbarButton
                onClick={() => {
                  editor
                    .chain()
                    .focus("end")
                    .insertContent("<p><strong>✨ Bulletproof Magic!</strong></p>", "html")
                    .command(({ tr }) => {
                      console.log("Current document size:", tr.doc.content.size);
                      return true;
                    })
                    .scrollIntoView()
                    .run();
                }}
                title="Test Bulletproof Chain"
                variant="brand"
              >
                <Plus className="w-4 h-4 text-brand animate-bounce" />
              </ToolbarButton>
            </div>

            <div className="flex-grow" />

            {/* System Group */}
            <div className="toolbar-group">
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt(
                    "Image URL:",
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800"
                  );
                  if (url) editor.runCommand("setImage", { src: url });
                }}
                title="Insert Image"
              >
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
              <ToolbarButton onClick={() => setIsDark(!isDark)} title="Toggle Dark Mode">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </ToolbarButton>
            </div>
          </div>

          {/* Editor Body */}
          <div className="editor-body">
            <ArkpadEditorContent editor={editor} className="arkpad-container p-4 md:p-8 lg:p-12" />
          </div>

          {/* Bubble Menu for quick edits */}
          <BubbleMenu editor={editor}>
            <div className="bubble-menu shadow-2xl border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 rounded-lg overflow-hidden border">
              <MenuButton editor={editor} command="toggleBold" name="strong">
                <Bold className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleItalic" name="em">
                <Italic className="w-4 h-4" />
              </MenuButton>
              <MenuButton editor={editor} command="toggleHighlight" name="highlight">
                <Highlighter className="w-4 h-4" />
              </MenuButton>
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Link URL:");
                  if (url) editor.runCommand("toggleLink", url);
                }}
              >
                <LinkIcon className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </BubbleMenu>

          {/* Floating Menu for quick insertion */}
          <FloatingMenu editor={editor}>
            <div className="floating-menu shadow-2xl border-slate-200/50 dark:border-slate-800/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-1 rounded-full border flex gap-1">
              <ToolbarButton onClick={() => editor.runCommand("toggleHeading", { level: 1 })}>
                <Heading1 className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("toggleBulletList")}>
                <List className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarButton onClick={() => editor.runCommand("toggleTaskList")}>
                <CheckSquare className="w-4 h-4" />
              </ToolbarButton>
              <ToolbarSeparator />
              <ToolbarButton
                onClick={() => {
                  const url = window.prompt("Image URL:");
                  if (url) editor.runCommand("setImage", { src: url });
                }}
              >
                <Plus className="w-4 h-4" />
              </ToolbarButton>
            </div>
          </FloatingMenu>
        </div>

        {/* Status Bar */}
        <div className="mt-4 flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold px-2">
          <div className="flex gap-6">
            <span className={isLocked ? "text-red-500 animate-pulse" : "text-green-500"}>
              {isLocked ? "Middleware Locked" : "System Online"}
            </span>
            <span>{editor.getText().length} Characters</span>
            <span className="text-brand opacity-60">Arkpad Master Core v1.7.0</span>
          </div>
          <div className="flex gap-4">
            <span>Production Grade Headless Engine</span>
            <span>Refreshed 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  PenLine,
} from "lucide-react";

import {
  useArkpadEditor,
  ArkpadEditorContent,
  useEditorState,
  ArkpadProvider,
} from "@arkpad/react";
import { CharacterCount } from "@arkpad/core";
import type { ArkpadEditorAPI } from "@arkpad/core";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
  variant?: "default" | "danger" | "success" | "brand";
  className?: string;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ onClick, isActive, disabled, children, title, variant = "default", className = "" }, ref) => (
    <button
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`toolbar-btn ${isActive ? "active" : ""} variant-${variant} ${className}`}
    >
      {children}
    </button>
  )
);

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

  const handleClick = () => {
    editor.runCommand(command, attrs);
  };

  return (
    <ToolbarButton
      onClick={handleClick}
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

function EditorFooter({ editor, isLocked }: { editor: ArkpadEditorAPI; isLocked: boolean }) {
  const characters = useEditorState(editor, (s) => s.storage.characterCount?.characters ?? 0);
  const words = useEditorState(editor, (s) => s.storage.characterCount?.words ?? 0);

  return (
    <div className="editor-footer">
      <div className="footer-left">
        <span className={isLocked ? "text-red-500 animate-pulse" : "text-green-500"}>
          {isLocked ? "Middleware Locked" : "System Online"}
        </span>
        <span>{characters} Characters</span>
        <span>{words} Words</span>
        <span className="text-brand opacity-60 font-black">FRAMEWORK PARITY: 100%</span>
      </div>
      <div className="footer-right">
        <span>Production Grade Headless Engine</span>
        <span>Refreshed 2026</span>
      </div>
    </div>
  );
}

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
    extensions: [
      CharacterCount,
      {
        name: "h4Theme",
        addGlobalAttributes() {
          return [
            {
              types: ["heading"],
              attributes: {
                class: {
                  default: null,
                  renderHTML: (attrs: Record<string, any>) => {
                    if (attrs.level === 4) return { class: "my-custom-h4-styling" };
                    return null;
                  },
                },
              },
            },
          ];
        },
      },
    ],
    content:
      "<h1>The Ultimate Arkpad UI</h1><p>Every single core feature is now active. From <strong>Formatting</strong> and <strong>Lists</strong> to <strong>Master APIs</strong> like Search/Replace and Middleware Interceptors. Try it all!</p><h4>I am a Header 4 with a Global Style!</h4><p>I was styled automatically via the Global Attribute API.</p>",
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

  const isHighlighterActive = useEditorState(editor, (s) => s.storage.highlighterTool?.active || s.isActive("highlight"));
  const isEraserActive = useEditorState(editor, (s) => s.storage.eraserTool?.active);

  const canUndo = useEditorState(editor, (s) => s.canRunCommand("undo"));
  const canRedo = useEditorState(editor, (s) => s.canRunCommand("redo"));

  // Expose editor to window for console debugging
  useEffect(() => {
    if (editor && typeof window !== "undefined") {
      (window as any).editor = editor;
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <ArkpadProvider editor={editor}>
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#000000] py-8 md:py-12 px-4 transition-colors duration-300">
        <div className="max-w-[1300px] mx-auto">
          <div className="editor-wrapper border-slate-200/50 dark:border-slate-800/50 shadow-2xl">
            <div className="toolbar-wrapper p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
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
                <ToolbarButton
                  onClick={() => editor.runCommand("toggleHighlighterTool")}
                  isActive={isHighlighterActive}
                  title="Highlighter Tool"
                  className="highlighter-btn"
                >
                  <Highlighter className="w-4 h-4" />
                </ToolbarButton>
                <MenuButton editor={editor} command="toggleCode" name="code" title="Inline Code">
                  <Code className="w-4 h-4" />
                </MenuButton>
                <ToolbarButton
                  onClick={() => {
                    // Clear painting modes

                    const url = window.prompt("Enter URL:", "https://");
                    if (url) editor?.runCommand("toggleLink", url);
                  }}
                  isActive={editor?.isActive("link")}
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
                  onClick={() => editor.runCommand("toggleEraserTool")}
                  isActive={isEraserActive}
                  title="Eraser Tool (Paint to Clear)"
                  className="eraser-btn"
                >
                  <Eraser className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <ToolbarSeparator />

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
                <ToolbarButton
                  onClick={() => {
                    // Clear painting modes
                    editor.runCommand("toggleHeading", { level: 4 });
                  }}
                  isActive={editor.isActive("heading", { level: 4 })}
                  title="H4 (Custom Proxy API)"
                >
                  <span className="text-[10px] font-bold">H4</span>
                </ToolbarButton>
                <MenuButton
                  editor={editor}
                  command="toggleBlockquote"
                  name="blockquote"
                  title="Blockquote (Style like Highlighter)"
                >
                  <PenLine className="w-4 h-4" />
                </MenuButton>
                <ToolbarButton
                  onClick={() => {
                    // Clear painting modes
                    editor?.runCommand("toggleCodeBlock");
                  }}
                  title="Code Block"
                >
                  <Terminal className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    // Clear painting modes
                    editor?.runCommand("setHorizontalRule");
                  }}
                  title="Horizontal Rule"
                >
                  <Minus className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <ToolbarSeparator />

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
                <ToolbarButton
                  onClick={() => {
                    editor.runCommand("indentList");
                  }}
                  title="Indent"
                >
                  <Indent className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    editor.runCommand("outdentList");
                  }}
                  title="Outdent"
                >
                  <Outdent className="w-4 h-4" />
                </ToolbarButton>
              </div>

              <ToolbarSeparator />

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
              </div>

              <div className="flex-grow" />

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
                <ToolbarButton
                  onClick={() => {
                    editor.runCommand("undo");
                  }}
                  disabled={!canUndo}
                  title="Undo (Mod-Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => {
                    editor.runCommand("redo");
                  }}
                  disabled={!canRedo}
                  title="Redo (Mod-Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </ToolbarButton>
                <ToolbarSeparator />
                <ToolbarButton
                  onClick={() => setIsDark(!isDark)}
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </ToolbarButton>
              </div>

            </div>

            <div className="editor-body">
              <ArkpadEditorContent editor={editor} className="arkpad-container p-4 md:p-8 lg:p-12" />
            </div>
          </div>

          <EditorFooter editor={editor} isLocked={isLocked} />
        </div>
      </div>
    </ArkpadProvider>
  );
}

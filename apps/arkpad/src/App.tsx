import React, { useState, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  List, 
  ListOrdered,
  Type,
  Sparkles,
  Code2,
  Quote,
  Minus,
  Image as ImageIcon,
  Undo2,
  Redo2,
  CheckSquare
} from "lucide-react";

import { type ArkpadEditorAPI } from "@arkpad/core";
import { ArkpadEditorComponent, BubbleMenu, FloatingMenu } from "@arkpad/react";

const ToolbarButton = ({ 
  onClick, 
  isActive, 
  disabled, 
  children, 
  title 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode; 
  title?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${
      isActive 
        ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    } ${disabled ? "opacity-30 cursor-not-allowed" : "active:scale-90"}`}
  >
    {children}
  </button>
);

const ToolbarSeparator = () => <div className="w-px h-6 bg-slate-200 mx-1" />;

export function App() {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);
  const [html, setHtml] = useState("<p>Welcome to <strong>Arkpad</strong> — a TipTap-inspired rich text editor built on ProseMirror.</p><p>Try formatting your text with the toolbar below, or use keyboard shortcuts like <code>Ctrl+B</code> for bold, <code>Ctrl+I</code> for italic.</p>");
  const [showHtml, setShowHtml] = useState(false);

  const run = useCallback((command: string, value?: any) => {
    if (!editor) return;
    editor.runCommand(command, value);
  }, [editor]);

  const isActive = useCallback((name: string, attrs?: Record<string, any>) => {
    if (!editor) return false;
    return editor.isActive(name, attrs);
  }, [editor]);

  const handleCopyHtml = useCallback(() => {
    navigator.clipboard.writeText(html);
  }, [html]);

  const canUndo = editor?.canRunCommand("undo") ?? false;
  const canRedo = editor?.canRunCommand("redo") ?? false;

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase border border-blue-100/50 shadow-sm">
          <Sparkles className="w-3 h-3" />
          Production Grade
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Ark<span className="text-blue-600">pad</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
          The high-performance, extension-driven editor framework.
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.05)] border border-slate-200/60 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-3 bg-slate-50/50 border-b border-slate-200/60 sticky top-0 z-30">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleBold")} isActive={isActive("strong")} title="Bold">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleItalic")} isActive={isActive("em")} title="Italic">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleUnderline")} isActive={isActive("underline")} title="Underline">
              <Type className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleCode")} isActive={isActive("code")} title="Inline Code">
              <Code2 className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleHeading", { level: 1 })} isActive={isActive("heading", { level: 1 })} title="H1">
              <Heading1 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleHeading", { level: 2 })} isActive={isActive("heading", { level: 2 })} title="H2">
              <Heading2 className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleBlockquote")} isActive={isActive("blockquote")} title="Blockquote">
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setHorizontalRule")} title="Horizontal Rule">
              <Minus className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleBulletList")} isActive={isActive("bullet_list")} title="Bullet List">
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleOrderedList")} isActive={isActive("ordered_list")} title="Ordered List">
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleTaskList")} isActive={isActive("task_list")} title="Task List">
              <CheckSquare className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <div className="flex-1 min-w-4" />

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("undo")} disabled={!canUndo} title="Undo">
              <Undo2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("redo")} disabled={!canRedo} title="Redo">
              <Redo2 className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-8 md:p-20 min-h-[600px] relative">
          <div className="max-w-3xl mx-auto">
            {/* Bubble Menu - The NEW Core Extension based component */}
            <BubbleMenu editor={editor}>
               <div className="flex items-center gap-1 bg-slate-900 text-white p-1.5 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => run('toggleBold')} 
                  className={`p-2 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-90 ${isActive('strong') ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => run('toggleItalic')} 
                  className={`p-2 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-90 ${isActive('em') ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                  onClick={() => run('toggleHeading', { level: 1 })} 
                  className={`p-2 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-90 flex items-center justify-center ${isActive('heading', { level: 1 }) ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => run('toggleHeading', { level: 2 })} 
                  className={`p-2 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-90 flex items-center justify-center ${isActive('heading', { level: 2 }) ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button 
                  onClick={() => run('toggleLink', 'https://')} 
                  className={`p-2 rounded-xl transition-all duration-200 hover:bg-white/10 active:scale-90 ${isActive('link') ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
              </div>
            </BubbleMenu>

            {/* Floating Menu - The NEW Core Extension based component */}
            <FloatingMenu editor={editor}>
               <div className="flex items-center bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200 p-1 animate-in fade-in slide-in-from-left-2 duration-300">
                <button 
                  onClick={() => run('toggleHeading', { level: 1 })}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                  title="Large Heading"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-slate-100 mx-0.5" />
                <button 
                  onClick={() => run('toggleBulletList')}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => run('setImage', 'https://picsum.photos/800/400')}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all active:scale-90"
                  title="Insert Image"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              </div>
            </FloatingMenu>

            <ArkpadEditorComponent
              content={html}
              onReady={(instance: ArkpadEditorAPI) => setEditor(instance)}
              onChange={({ html: nextHtml }: { html: string }) => setHtml(nextHtml)}
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-80 hover:opacity-100 transition-opacity">
        <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-800/50">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-widest">
              <Code2 className="w-4 h-4 text-blue-400" />
              HTML Source
            </h2>
            <button 
              type="button" 
              onClick={handleCopyHtml}
              className="text-xs font-bold px-4 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all border border-slate-600/50"
            >
              Copy
            </button>
          </div>
          <div className="p-6 overflow-auto max-h-[300px] scrollbar-thin scrollbar-thumb-slate-700">
            <pre className="font-mono text-[10px] leading-relaxed text-blue-200/80 whitespace-pre-wrap break-all">
              {html}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200/60 p-8 flex flex-col gap-6">
          <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
            <Type className="w-4 h-4 text-blue-500" />
            Live Preview
          </h2>
          <div className="flex-1 overflow-auto max-h-[220px] prose prose-slate prose-sm" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 text-xs font-semibold tracking-wide uppercase">
        &copy; {new Date().getFullYear()} Arkpad &bull; Production Grade Editor Framework
      </footer>
    </div>
  );
}
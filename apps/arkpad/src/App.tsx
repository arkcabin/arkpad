import React, { useState, useCallback } from "react";
import { 
  Bold, 
  Italic, 
  Underline,
  Strikethrough,
  Heading1, 
  Heading2, 
  Heading3,
  Heading4,
  Link as LinkIcon, 
  List, 
  ListOrdered,
  Type,
  Sparkles,
  Code2,
  Terminal,
  Quote,
  Minus,
  Image as ImageIcon,
  Undo2,
  Redo2,
  CheckSquare,
  Hash,
  Scissors
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
  const [html, setHtml] = useState("<p>Welcome to <strong>Arkpad</strong> — the professional editor framework.</p><p>This demo now showcases <strong>every single extension</strong> in our library. Try them all out below!</p>");
  const [, setPulse] = useState(0);

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
    <div className="min-h-screen bg-[#f8f9fc] py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col items-center text-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wider uppercase border border-blue-100/50 shadow-sm">
          <Sparkles className="w-3 h-3" />
          Feature Complete
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Ark<span className="text-blue-600">pad</span> <span className="font-light text-slate-400">Pro</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
          The ultimate editor library. Every feature, perfectly tuned.
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-[0_20px_80px_rgba(0,0,0,0.06)] border border-slate-200/60 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-50/80 border-b border-slate-200/60 sticky top-0 z-30 backdrop-blur-sm">
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleBold")} isActive={isActive("strong")} title="Bold">
              <Bold className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleItalic")} isActive={isActive("em")} title="Italic">
              <Italic className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleUnderline")} isActive={isActive("underline")} title="Underline">
              <Underline className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleStrike")} isActive={isActive("strike")} title="Strikethrough">
              <Strikethrough className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleCode")} isActive={isActive("code")} title="Inline Code">
              <Code2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleLink", "https://arkpad.dev")} isActive={isActive("link")} title="Link">
              <LinkIcon className="w-4 h-4" />
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
            <ToolbarButton onClick={() => run("toggleHeading", { level: 3 })} isActive={isActive("heading", { level: 3 })} title="H3">
              <Heading3 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleHeading", { level: 4 })} isActive={isActive("heading", { level: 4 })} title="H4">
              <Heading4 className="w-4 h-4" />
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleBlockquote")} isActive={isActive("blockquote")} title="Blockquote">
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleCodeBlock")} isActive={isActive("codeBlock")} title="Code Block">
              <Terminal className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setHorizontalRule")} title="Horizontal Rule">
              <Minus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setImage", "https://picsum.photos/1200/600")} title="Insert Image">
              <ImageIcon className="w-4 h-4" />
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
        <div className="flex-1 p-10 md:p-24 min-h-[700px] relative">
          <div className="max-w-3xl mx-auto">
            <BubbleMenu editor={editor}>
               <div className="flex items-center gap-1 bg-slate-900 text-white p-1.5 rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                <button onClick={() => run('toggleBold')} className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive('strong') ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}><Bold className="w-4 h-4" /></button>
                <button onClick={() => run('toggleItalic')} className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive('em') ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}><Italic className="w-4 h-4" /></button>
                <button onClick={() => run('toggleStrike')} className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive('strike') ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}><Strikethrough className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={() => run('toggleHeading', { level: 1 })} className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive('heading', { level: 1 }) ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}><Heading1 className="w-4 h-4" /></button>
                <button onClick={() => run('toggleHeading', { level: 2 })} className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive('heading', { level: 2 }) ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}><Heading2 className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <button onClick={() => run('toggleLink', 'https://')} className={`p-2 rounded-xl hover:bg-white/10 transition-all ${isActive('link') ? 'text-blue-400 bg-white/5' : 'text-slate-300'}`}><LinkIcon className="w-4 h-4" /></button>
              </div>
            </BubbleMenu>

            <FloatingMenu editor={editor}>
               <div className="flex items-center bg-white rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.1)] border border-slate-200 p-1 animate-in fade-in slide-in-from-left-4 duration-300">
                <button onClick={() => run('toggleHeading', { level: 1 })} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"><Heading1 className="w-4 h-4" /></button>
                <button onClick={() => run('toggleHeading', { level: 2 })} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"><Heading2 className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-slate-100 mx-1" />
                <button onClick={() => run('toggleBulletList')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"><List className="w-4 h-4" /></button>
                <button onClick={() => run('toggleTaskList')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"><CheckSquare className="w-4 h-4" /></button>
                <button onClick={() => run('toggleCodeBlock')} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all"><Terminal className="w-4 h-4" /></button>
              </div>
            </FloatingMenu>

            <ArkpadEditorComponent
              content={html}
              onReady={(instance: ArkpadEditorAPI) => setEditor(instance)}
              onUpdate={() => setPulse(p => p + 1)}
              onChange={({ html: nextHtml }: { html: string }) => setHtml(nextHtml)}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-8 py-3 bg-white rounded-full shadow-sm border border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Editor Ready</span>
          <span>&bull;</span>
          <span>ProseMirror Core</span>
          <span>&bull;</span>
          <span>Lucide Icons</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{html.length} Characters</span>
          <span>&bull;</span>
          <button onClick={handleCopyHtml} className="hover:text-blue-600 transition-colors">Copy HTML</button>
        </div>
      </div>
    </div>
  );
}
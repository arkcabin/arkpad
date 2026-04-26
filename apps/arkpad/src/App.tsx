import React, { useState, useCallback } from "react";

import { type ArkpadEditorAPI } from "@arkpad/core";
import { ArkpadEditorComponent } from "@arkpad/react";

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
    className={`toolbar-btn ${isActive ? "active" : ""}`}
    title={title}
  >
    {children}
  </button>
);

const ToolbarSeparator = () => <div className="toolbar-separator" />;

export function App() {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);
  const [html, setHtml] = useState("<p>Welcome to <strong>Arkpad</strong> — a TipTap-inspired rich text editor built on ProseMirror.</p><p>Try formatting your text with the toolbar below, or use keyboard shortcuts like <code>Ctrl+B</code> for bold, <code>Ctrl+I</code> for italic.</p>");
  const [showHtml, setShowHtml] = useState(true);

  const run = useCallback((command: string, value?: any) => {
    if (!editor) return;
    if (value !== undefined) {
      editor.runCommand(command, value);
    } else {
      editor.runCommand(command);
    }
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col gap-8">
      <header className="flex flex-col items-center text-center gap-2">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold tracking-wide uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next Gen Editor
        </div>
        <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-6xl">
          Ark<span className="text-blue-600">pad</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
          The headless rich text editor framework that powers beautiful writing experiences.
        </p>
      </header>

      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-200/60 overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-50/50 border-b border-slate-200/60 sticky top-0 z-10">
          <div className="flex items-center gap-0.5 bg-white p-1 rounded-xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleBold")} isActive={isActive("strong")} title="Bold (Ctrl+B)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleItalic")} isActive={isActive("em")} title="Italic (Ctrl+I)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleUnderline")} isActive={isActive("underline")} title="Underline (Ctrl+U)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleStrike")} isActive={isActive("strike")} title="Strikethrough">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2"/><path d="M8.7 19.1c2.3.6 4.4 1 6.2.9 2.7 0 5.3-.7 5.3-3.6 0-1.5-1.8-3.3-3.6-3.9h-.2"/><line x1="4" y1="12" x2="20" y2="12"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleCode")} isActive={isActive("code")} title="Inline Code (Ctrl+E)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-0.5 bg-white p-1 rounded-xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("setParagraph")} isActive={isActive("paragraph")} title="Paragraph">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setHeading1")} isActive={isActive("heading", { level: 1 })} title="Heading 1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setHeading2")} isActive={isActive("heading", { level: 2 })} title="Heading 2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setHeading3")} isActive={isActive("heading", { level: 3 })} title="Heading 3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12h8M4 18V6M12 18V6M17.5 10.5c.5 0 2.5-.5 2.5 1.5s-2 1.5-2.5 1.5c.5 0 2.5.5 2.5 2.5s-2 1.5-2.5 1.5"/></svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-0.5 bg-white p-1 rounded-xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("setBlockquote")} isActive={isActive("blockquote")} title="Blockquote">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 17h3l2-4V7H5v6h3l-2 4z"/><path d="M14 17h3l2-4V7h-6v6h3l-2 4z"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleCodeBlock")} isActive={isActive("code_block")} title="Code Block">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 9 6 12 9 15"/><polyline points="15 9 18 12 15 15"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setHorizontalRule")} title="Horizontal Rule">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="2" y1="12" x2="22" y2="12"/></svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-0.5 bg-white p-1 rounded-xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("toggleBulletList")} isActive={isActive("bullet_list")} title="Bullet List">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleOrderedList")} isActive={isActive("ordered_list")} title="Ordered List">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="7" fontSize="6" fontWeight="bold" fill="currentColor">1</text><text x="3" y="13" fontSize="6" fontWeight="bold" fill="currentColor">2</text><text x="3" y="19" fontSize="6" fontWeight="bold" fill="currentColor">3</text></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("toggleTaskList")} isActive={isActive("task_list")} title="Task List">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="M5 11l2-2 2 2"/><line x1="12" y1="8" x2="21" y2="8"/><line x1="12" y1="16" x2="21" y2="16"/></svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="flex items-center gap-0.5 bg-white p-1 rounded-xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("setLink", "https://")} isActive={isActive("link")} title="Add Link (Ctrl+K)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("setImage", "https://picsum.photos/800/400")} title="Add Image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </ToolbarButton>
          </div>

          <div className="flex-1 min-w-4" />

          <div className="flex items-center gap-0.5 bg-white p-1 rounded-xl shadow-sm border border-slate-200/40">
            <ToolbarButton onClick={() => run("undo")} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </ToolbarButton>
            <ToolbarButton onClick={() => run("redo")} disabled={!canRedo} title="Redo (Ctrl+Y)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </ToolbarButton>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-8 md:p-12 min-h-[500px]">
          <div className="max-w-3xl mx-auto">
            <ArkpadEditorComponent
              content={html}
              onReady={(instance: ArkpadEditorAPI) => setEditor(instance)}
              onChange={({ html: nextHtml }: { html: string }) => setHtml(nextHtml)}
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-800/50">
            <h2 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              HTML Source
            </h2>
            <button 
              type="button" 
              onClick={handleCopyHtml}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors border border-slate-600/50"
            >
              Copy
            </button>
          </div>
          <div className="p-6 overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-700">
            <pre className="font-mono text-xs leading-relaxed text-blue-200/90 whitespace-pre-wrap break-all">
              {html}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-200/60 p-8 flex flex-col gap-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Quick Preview
          </h2>
          <div className="flex-1 overflow-auto max-h-[300px] prose prose-slate prose-sm" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="pt-6 border-t border-slate-100 mt-auto">
            <p className="text-sm text-slate-500 italic leading-relaxed">
              Real-time preview of your rich text content as it will appear in your production environment.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-slate-400 text-sm font-medium">
        &copy; {new Date().getFullYear()} Arkpad Editor Framework. Built with ProseMirror and Passion.
      </footer>
    </div>
  );
}
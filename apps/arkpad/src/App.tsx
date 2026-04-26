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
    <div className="editor-wrapper">
      <header className="editor-header">
        <h1>Arkpad</h1>
        <p>A TipTap-inspired editor built with ProseMirror</p>
      </header>

      <div className="editor-container">
        <div className="toolbar">
          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => run("toggleBold")}
              isActive={isActive("strong")}
              title="Bold (Ctrl+B)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
                <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("toggleItalic")}
              isActive={isActive("em")}
              title="Italic (Ctrl+I)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="19" y1="4" x2="10" y2="4"/>
                <line x1="14" y1="20" x2="5" y2="20"/>
                <line x1="15" y1="4" x2="9" y2="20"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("toggleUnderline")}
              isActive={isActive("underline")}
              title="Underline (Ctrl+U)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/>
                <line x1="4" y1="21" x2="20" y2="21"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("toggleStrike")}
              isActive={isActive("strike")}
              title="Strikethrough"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2"/>
                <path d="M8.7 19.1c2.3.6 4.4 1 6.2.9 2.7 0 5.3-.7 5.3-3.6 0-1.5-1.8-3.3-3.6-3.9h-.2"/>
                <line x1="4" y1="12" x2="20" y2="12"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("toggleCode")}
              isActive={isActive("code")}
              title="Inline Code (Ctrl+E)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="toolbar-group">
          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => run("setParagraph")}
              isActive={isActive("paragraph")}
              title="Paragraph"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 7h16M4 12h16M4 17h10"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("setHeading1")}
              isActive={isActive("heading", { level: 1 })}
              title="Heading 1"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 12h8M4 18V6M12 18V6M17 12l3-2v8"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("setHeading2")}
              isActive={isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("setHeading3")}
              isActive={isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 12h8M4 18V6M12 18V6M17.5 10.5c.5 0 2.5-.5 2.5 1.5s-2 1.5-2.5 1.5c.5 0 2.5.5 2.5 2.5s-2 1.5-2.5 1.5"/>
              </svg>
            </ToolbarButton>
          </div>
          </div>

          <ToolbarSeparator />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => run("setBlockquote")}
              isActive={isActive("blockquote")}
              title="Blockquote"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 17h3l2-4V7H5v6h3l-2 4z"/>
                <path d="M14 17h3l2-4V7h-6v6h3l-2 4z"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("toggleCodeBlock")}
              isActive={isActive("code_block")}
              title="Code Block"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <polyline points="9 9 6 12 9 15"/>
                <polyline points="15 9 18 12 15 15"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("setHorizontalRule")}
              title="Horizontal Rule"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="2" y1="12" x2="22" y2="12"/>
              </svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => run("toggleBulletList")}
              isActive={isActive("bullet_list")}
              title="Bullet List"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="9" y1="6" x2="20" y2="6"/>
                <line x1="9" y1="12" x2="20" y2="12"/>
                <line x1="9" y1="18" x2="20" y2="18"/>
                <circle cx="4" cy="6" r="1.5" fill="currentColor"/>
                <circle cx="4" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="4" cy="18" r="1.5" fill="currentColor"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("toggleOrderedList")}
              isActive={isActive("ordered_list")}
              title="Ordered List"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="10" y1="6" x2="21" y2="6"/>
                <line x1="10" y1="12" x2="21" y2="12"/>
                <line x1="10" y1="18" x2="21" y2="18"/>
                <text x="3" y="7" fontSize="6" fill="currentColor">1</text>
                <text x="3" y="13" fontSize="6" fill="currentColor">2</text>
                <text x="3" y="19" fontSize="6" fill="currentColor">3</text>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("toggleTaskList")}
              isActive={isActive("task_list")}
              title="Task List"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="5" width="6" height="6" rx="1"/>
                <path d="M5 11l2-2 2 2"/>
                <line x1="12" y1="8" x2="21" y2="8"/>
                <line x1="12" y1="16" x2="21" y2="16"/>
              </svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => run("setLink", "https://")}
              isActive={isActive("link")}
              title="Add Link (Ctrl+K)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("setImage", "https://picsum.photos/600/300")}
              title="Add Image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </ToolbarButton>
          </div>

          <ToolbarSeparator />

          <div className="toolbar-group">
            <ToolbarButton
              onClick={() => run("undo")}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 7v6h6"/>
                <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => run("redo")}
              disabled={!canRedo}
              title="Redo (Ctrl+Y)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 7v6h-6"/>
                <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
              </svg>
            </ToolbarButton>
          </div>
        </div>

        <div className="editor-content">
          <ArkpadEditorComponent
            content={html}
            onReady={(instance: ArkpadEditorAPI) => setEditor(instance)}
            onChange={({ html: nextHtml }: { html: string }) => setHtml(nextHtml)}
          />
        </div>
      </div>

      <div className="output-panel">
        <div className="output-header">
          <h2>HTML Output</h2>
          <button type="button" onClick={handleCopyHtml}>Copy</button>
        </div>
        <div className="output-content">
          <pre>{html}</pre>
        </div>
      </div>
    </div>
  );
}
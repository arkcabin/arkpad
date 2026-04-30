import React from "react";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
} from "lucide-react";

import {
  useArkpadEditor,
  ArkpadEditorContent,
  ArkpadProvider,
  EditorButton,
} from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";

function MenuButton({
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
      className="toolbar-btn"
      activeClassName="active"
    >
      {children}
    </EditorButton>
  );
}

export function App() {
  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: "<h1>Welcome to Arkpad</h1><p>This is the full editor showcase. Explore individual extensions in the sidebar to see how each module works in isolation.</p><p>Arkpad is built for performance and modularity.</p>",
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)] overflow-hidden transition-colors duration-300">
        <header className="h-14 px-6 border-b border-[var(--border)] flex items-center justify-between">
           <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Full Platform</div>
           <div className="text-[10px] text-[var(--text-muted)] font-mono">v1.6.13</div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--text-main)]">Interactive Playground</h2>
              <p className="text-sm text-[var(--text-muted)]">Test the entire @arkpad/starter-kit in a unified environment.</p>
            </div>

            <div className="border border-[var(--border)] rounded-none bg-[var(--bg-main)]">
              <div className="h-12 px-3 border-b border-[var(--border)] flex items-center gap-1">
                <MenuButton command="toggleBold" name="strong"><Bold className="w-3.5 h-3.5" /></MenuButton>
                <MenuButton command="toggleItalic" name="em"><Italic className="w-3.5 h-3.5" /></MenuButton>
                <div className="w-px h-4 bg-[var(--border)] mx-1" />
                <MenuButton command="toggleBulletList" name="bulletList"><List className="w-3.5 h-3.5" /></MenuButton>
                <MenuButton command="toggleOrderedList" name="orderedList"><ListOrdered className="w-3.5 h-3.5" /></MenuButton>
              </div>
              <div className="p-8 min-h-[500px]">
                <ArkpadEditorContent 
                  editor={editor} 
                  className="prose dark:prose-invert max-w-none focus:outline-none arkpad-container" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ArkpadProvider>
  );
}

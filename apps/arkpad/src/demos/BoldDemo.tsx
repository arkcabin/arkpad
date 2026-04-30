import React from "react";
import { Bold as BoldExtension } from "@arkpad/extension-bold";
import { 
  createDocument, 
  createParagraph, 
  createText 
} from "@arkpad/core";
import { 
  useArkpadEditor, 
  ArkpadEditorContent, 
  ArkpadProvider, 
  EditorButton 
} from "@arkpad/react";
import { Bold as BoldIcon } from "lucide-react";

export function BoldDemo() {
  const editor = useArkpadEditor({
    extensions: [
      createDocument(),
      createParagraph(),
      createText(),
      BoldExtension,
    ],
    content: "<h1>Isolated Bold Extension</h1><p>This editor <strong>only</strong> knows how to handle Bold. If you try to use other commands (like Italic or Lists), they will not work because their extensions are not loaded.</p><p>Use the button in the toolbar or press <code>Mod+B</code>.</p>",
  });

  if (!editor) {
    return null;
  }

  return (
    <ArkpadProvider editor={editor}>
      <div className="h-full flex flex-col bg-slate-50 dark:bg-black p-4 md:p-8 animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
          <header className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Isolated Extension Test</h2>
            <p className="text-slate-500 text-sm mt-1">Environment: Isolated @arkpad/extension-bold</p>
          </header>

          <div className="bg-white dark:bg-[#0c0c0c] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col flex-grow overflow-hidden">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2">
              <EditorButton
                command="toggleBold"
                name="strong"
                className="toolbar-btn"
                activeClassName="active"
              >
                <BoldIcon className="w-4 h-4" />
              </EditorButton>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-2">
                Schema: [doc, p, text, strong]
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-8">
              <ArkpadEditorContent 
                editor={editor} 
                className="prose dark:prose-invert max-w-none focus:outline-none min-h-full"
              />
            </div>
          </div>
          
          <footer className="mt-6 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            <div>Standalone Lab</div>
            <div className="text-brand">Verified: 2026 Stable</div>
          </footer>
        </div>
      </div>
    </ArkpadProvider>
  );
}

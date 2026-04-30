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
      <div className="h-full flex flex-col bg-white dark:bg-[#050505]">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="toolbar-wrapper p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <div className="toolbar-group">
              <EditorButton
                command="toggleBold"
                name="strong"
                className="toolbar-btn"
                activeClassName="active"
              >
                <BoldIcon className="w-4 h-4" />
              </EditorButton>
              <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 hidden md:inline">
                Isolation Mode: @arkpad/extension-bold
              </span>
            </div>
            
            <div className="text-[10px] font-mono text-brand font-bold uppercase tracking-widest px-4 border border-brand/20 bg-brand/5 rounded-full py-1">
              Isolated Lab Environment
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-12 lg:p-20">
            <div className="max-w-4xl mx-auto">
              <ArkpadEditorContent 
                editor={editor} 
                className="prose dark:prose-invert max-w-none focus:outline-none min-h-full arkpad-container"
              />
            </div>
          </div>
        </div>
        
        <div className="editor-footer px-6 border-t border-slate-100 dark:border-slate-900 h-10 flex items-center justify-between">
            <div className="flex gap-4">
              <span className="text-brand">Verified: Stable v1.6.13</span>
              <span className="opacity-50">Schema: Isolated Marks</span>
            </div>
            <div className="text-slate-400">Production Engine: Arkpad Core</div>
        </div>
      </div>
    </ArkpadProvider>
  );
}

import React from "react";
import { Bold } from "@arkpad/extension-bold";
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
import { Bold as BoldIcon, ArrowLeft } from "lucide-react";

export function BoldDemo({ onBack }: { onBack: () => void }) {
  const editor = useArkpadEditor({
    extensions: [
      createDocument(),
      createParagraph(),
      createText(),
      Bold,
    ],
    content: "<h1>Bold Only Demo</h1><p>In this mode, <strong>only bold</strong> works. Try pressing <code>Mod+B</code> or using the button below. Other marks like italic will be ignored.</p>",
    onCreate: () => {
      console.log("Bold Demo Editor Created");
    }
  });

  if (!editor) {
    return null;
  }

  return (
    <ArkpadProvider editor={editor}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <button 
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main App
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex gap-2">
              <EditorButton
                command="toggleBold"
                name="strong"
                className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                activeClassName="bg-slate-200 dark:bg-slate-800 text-brand"
              >
                <BoldIcon className="w-5 h-5" />
              </EditorButton>
              <div className="flex-grow" />
              <div className="px-3 py-1 text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center">
                Isolated Bold Extension
              </div>
            </div>

            <div className="p-6">
              <ArkpadEditorContent 
                editor={editor} 
                className="prose dark:prose-invert max-w-none focus:outline-none min-h-[200px]"
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
            <h3 className="text-blue-800 dark:text-blue-300 font-semibold mb-2">Technical Note</h3>
            <p className="text-blue-700/80 dark:text-blue-400/80 text-sm">
              This page demonstrates the <strong>Arkpad Atomic Extension</strong> architecture. 
              Only the <code>@arkpad/extension-bold</code> package is registered. 
              The <code>StarterKit</code> is NOT used here.
            </p>
          </div>
        </div>
      </div>
    </ArkpadProvider>
  );
}

import React from "react";
import { Italic as ItalicExtension } from "@arkpad/extension-italic";
import { Heading } from "@arkpad/extension-heading";
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
import { Italic as ItalicIcon } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function ItalicDemo() {
  const editor = useArkpadEditor({
    extensions: [
      createDocument(),
      createParagraph(),
      createText(),
      Heading,
      ItalicExtension,
    ],
    content: "<h1>Italic Extension</h1><p>This editor <em>only</em> handles emphasis. <i>Italic text</i> helps highlight key points without changing the weight of the font.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Italic"
      description="The Italic extension toggles emphasis formatting. It uses semantic <em> tags by default but can also handle <i> tags for compatibility."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col h-[400px]">
          <div className="h-10 px-3 border-b border-slate-100 dark:border-slate-900 flex items-center bg-slate-50/50 dark:bg-white/[0.02]">
            <EditorButton
              command="toggleItalic"
              name="em"
              className="w-8 h-8 flex items-center justify-center rounded transition-colors text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 [&.active]:text-slate-900 dark:[&.active]:text-white [&.active]:bg-slate-100 dark:[&.active]:bg-slate-800"
              activeClassName="active"
            >
              <ItalicIcon className="w-3.5 h-3.5" />
            </EditorButton>
          </div>
          <div className="flex-1 p-8 overflow-y-auto">
            <ArkpadEditorContent 
              editor={editor} 
              className="prose dark:prose-invert max-w-none focus:outline-none arkpad-container"
            />
          </div>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

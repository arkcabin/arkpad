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
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function BoldDemo() {
  const editor = useArkpadEditor({
    extensions: [
      createDocument(),
      createParagraph(),
      createText(),
      BoldExtension,
    ],
    content: "<h1>Bold Extension</h1><p>This editor <strong>only</strong> handles bold text. Try selecting this text and pressing Mod+B.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Bold"
      description="Toggles strong formatting on selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleBold"
              name="strong"
              className="toolbar-btn"
              activeClassName="active"
            >
              <BoldIcon className="w-4 h-4" />
            </EditorButton>
          </div>
          <div className="p-8">
            <ArkpadEditorContent 
              editor={editor} 
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

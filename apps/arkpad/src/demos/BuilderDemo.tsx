import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";

/**
 * BARE MINIMUM FULL-SCREEN BUILDER
 * A completely clean, blank slate for building from scratch.
 */
export function BuilderDemo() {
  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: "",
    contentTag: "main",
    editable: true,
    autofocus: false,
  });

  return (
    <div className="flex flex-col flex-1 h-screen w-screen bg-white overflow-hidden">
      <ArkpadProvider editor={editor}>
        <style>{`
          .ProseMirror {
            flex: 1;
            min-height: 100vh;
            width: 100%;
            outline: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Absolute Silence */
          .ark-builder-toolbar, 
          .ark-builder-toolbar-label, 
          .ark-builder-toolbar-actions,
          .ark-hovered-node,
          .ark-selected-node,
          [data-arkpad-ignore="true"] {
            display: none !important;
          }
        `}</style>
        <main id="arkpad-builder-canvas" className="flex-1 flex flex-col w-full h-full">
          <div className="w-full h-full flex-1 arkpad-editor-container">
            <ArkpadEditorContent editor={editor} className="w-full h-full flex-1" />
          </div>
        </main>
      </ArkpadProvider>
    </div>
  );
}

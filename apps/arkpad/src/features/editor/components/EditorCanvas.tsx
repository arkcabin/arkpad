import { ArkpadEditorContent } from "@arkpad/react";
import type { ArkpadEditorAPI } from "@arkpad/core";

export function EditorCanvas({ editor }: { editor: ArkpadEditorAPI }) {
  return (
    <div className="editor-frame">
      <ArkpadEditorContent editor={editor} className="editor-surface" />
    </div>
  );
}

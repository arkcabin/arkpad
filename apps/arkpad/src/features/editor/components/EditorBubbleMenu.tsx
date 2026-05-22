import { BubbleMenu } from "@arkpad/react";
import type { ArkpadEditorAPI } from "@arkpad/core";

export function EditorBubbleMenu({ editor }: { editor: ArkpadEditorAPI }) {
  return <BubbleMenu editor={editor} defaultToolbar />;
}

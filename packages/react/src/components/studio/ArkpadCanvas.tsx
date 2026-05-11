import React from "react";
import { ArkpadEditorContent } from "../editor/ArkpadEditorContent";
import { useArkpadContext } from "../editor/context";
import { cn } from "../../utils/utils";
import { useEditorStore } from "../../stores/editorStore";
import { StudioBubbleMenu } from "./StudioBubbleMenu";
import type { ArkpadEditorAPI } from "@arkpad/core";

export interface ArkpadCanvasProps {
  device?: "desktop" | "tablet" | "mobile";
  className?: string;
  editor?: ArkpadEditorAPI | null;
}

export function ArkpadCanvas({
  device = "desktop",
  className,
  editor: propEditor,
}: ArkpadCanvasProps) {
  const contextEditor = useArkpadContext();
  const editor = propEditor || contextEditor;
  const selectedNodePos = useEditorStore((s) => s.selectedNodePos);

  React.useEffect(() => {
    if (!editor) return;
    useEditorStore.getState().init(editor);
    return () => useEditorStore.getState().destroy();
  }, [editor]);

  return (
    <div className={cn("arkpad-canvas-viewport scrollbar-hide", className)}>
      <div className="arkpad-canvas-container" data-device={device}>
        <div className="arkpad-canvas-frame">
          <div className="arkpad-page-root-container" data-selected-pos={selectedNodePos}>
            <ArkpadEditorContent editor={editor} className="arkpad-builder-canvas" />
            <StudioBubbleMenu />
          </div>
        </div>
      </div>
      <div className="h-20 w-full flex-shrink-0" />
    </div>
  );
}

import { ArkpadEditorContent } from "../editor/ArkpadEditorContent";
import { useArkpadContext } from "../editor/context";
import { cn } from "../../utils/utils";
import { ArkpadEditorAPI } from "@arkpad/core";

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

  return (
    <div className={cn("arkpad-canvas-viewport scrollbar-hide", className)}>
      <div className="arkpad-canvas-container" data-device={device}>
        <div className="arkpad-canvas-frame">
          <div className="arkpad-page-root-container">
            <ArkpadEditorContent
              editor={editor}
              className="arkpad-builder-canvas"
            />
          </div>
        </div>
      </div>
      <div className="h-20 w-full flex-shrink-0" />
    </div>
  );
}

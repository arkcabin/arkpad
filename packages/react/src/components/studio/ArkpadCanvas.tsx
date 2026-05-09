import React from "react";
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
  device: _device = "desktop",
  className,
  editor: propEditor,
}: ArkpadCanvasProps) {
  const contextEditor = useArkpadContext();
  const editor = propEditor || contextEditor;

  return (
    <div
      className={cn(
        "flex-1 h-full w-full relative flex justify-center bg-neutral-100 dark:bg-neutral-950 p-10 overflow-auto",
        className
      )}
    >
      <div className="bg-white dark:bg-neutral-900 shadow-xl min-h-full w-full max-w-4xl arkpad-builder-canvas relative">
        <div className="arkpad-page-root-container min-h-full">
          <div className="arkpad-page-root-label">Page Root</div>
          <ArkpadEditorContent editor={editor} className="min-h-[500px]" />
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";
import { ArkpadEditorAPI } from "@arkpad/core";

export interface ArkpadEditorContentProps {
  editor: ArkpadEditorAPI | null;
  className?: string;
}

/**
 * ArkpadEditorContent - The component that renders the Arkpad editor.
 */
export function ArkpadEditorContent({ editor, className }: ArkpadEditorContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Use standardized Arkpad styling classes
  const combinedClassName = className || "max-w-none arkpad-content-area arkpad-editor-canvas";

  useEffect(() => {
    if (!editor || !containerRef.current) return;

    const container = containerRef.current;
    const editorElement = editor.element;

    if (!container.contains(editorElement)) {
      container.innerHTML = "";
      container.appendChild(editorElement);
    }
  }, [editor]);

  return <div ref={containerRef} className={combinedClassName} data-arkpad-content />;
}

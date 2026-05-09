import React, { useEffect, useRef } from "react";
import { ArkpadEditorAPI } from "@arkpad/core";

export interface ArkpadEditorContentProps {
  editor: ArkpadEditorAPI | null;
  className?: string;
}

/**
 * ArkpadEditorContent - The component that renders the Arkpad editor.
 * 
 * NOTE: We use appendChild manually because the editor instance manages its own DOM.
 * We must ensure that React doesn't accidentally remove the editor's element during re-renders.
 */
export function ArkpadEditorContent({ editor, className }: ArkpadEditorContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || !containerRef.current) return;

    const container = containerRef.current;
    const editorElement = editor.element;

    // Ensure the editor element is attached to our container
    if (!container.contains(editorElement)) {
      // Clear container first just in case
      container.innerHTML = "";
      container.appendChild(editorElement);
    }

    // When the editor is ready, focus it if autofocus is enabled
    // We can also trigger a view update here if needed
  }, [editor]);

  // We return a div that we manage manually. 
  // By not having any children in JSX, React won't try to reconcile its contents.
  return (
    <div 
      ref={containerRef} 
      className={className} 
      // This is a hint to React/others that this element's children are managed externally
      data-arkpad-content 
    />
  );
}

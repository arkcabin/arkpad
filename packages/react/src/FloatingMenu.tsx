import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FloatingMenu as FloatingMenuExtension, ArkpadEditorAPI } from "@arkpad/core";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export interface FloatingMenuProps {
  editor: ArkpadEditorAPI | null;
  children: React.ReactNode;
  className?: string;
  shouldShow?: (props: { state: EditorState; view: EditorView }) => boolean;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  editor,
  children,
  className = "",
  shouldShow,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const element = containerRef.current;
    if (!element) return;

    const extension = FloatingMenuExtension({
      editor,
      element,
      shouldShow,
    });

    editor.registerExtension(extension);

    return () => {
      // Cleanup
    };
  }, [editor]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "fixed",
        visibility: "hidden",
        zIndex: 1000,
        pointerEvents: "auto",
        display: "none",
      }}
    >
      {children}
    </div>,
    document.body
  );
};

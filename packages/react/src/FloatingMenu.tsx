import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArkpadEditorAPI } from "@arkpad/core";
import { FloatingMenu as FloatingMenuExtension } from "@arkpad/extension-floating-menu";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useMenuPositioner } from "./useMenuPositioner";

export interface FloatingMenuProps {
  editor: ArkpadEditorAPI | null;
  children: React.ReactNode;
  className?: string;
  offset?: number;
  shouldShow?: (props: { state: EditorState; view: EditorView }) => boolean;
}

/**
 * FloatingMenu component that leverages the Headless Menu Engine in @arkpad/core.
 * It provides zero-flicker, GPU-accelerated positioning.
 */
export const FloatingMenu: React.FC<FloatingMenuProps> = ({
  editor,
  children,
  className = "",
  offset = 40,
  shouldShow,
}) => {
  const { ref, style, active } = useMenuPositioner({
    editor,
    extensionName: "floatingMenu",
    type: "floating",
    offset,
  });

  useEffect(() => {
    if (!editor) return;

    const extension = FloatingMenuExtension.configure({
      shouldShow: shouldShow as any,
    });

    editor.registerExtension(extension);

    return () => {
      editor.unregisterExtension(extension.name);
    };
  }, [editor, shouldShow]);

  if (typeof document === "undefined" || !active) return null;

  return createPortal(
    <div ref={ref} style={style} className={className}>
      {children}
    </div>,
    document.body
  );
};

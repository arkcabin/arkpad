import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { ArkpadEditorAPI } from "@arkpad/core";
import { BubbleMenu as BubbleMenuExtension } from "@arkpad/extension-bubble-menu";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { useMenuPositioner } from "../../hooks/useMenuPositioner";

export interface BubbleMenuProps {
  editor: ArkpadEditorAPI | null;
  children: React.ReactNode;
  className?: string;
  offset?: number;
  shouldShow?: (props: {
    state: EditorState;
    view: EditorView;
    from: number;
    to: number;
    empty: boolean;
  }) => boolean;
  placement?: "center" | "top-right" | "top-left";
}

/**
 * BubbleMenu component that leverages the Headless Menu Engine in @arkpad/core.
 * It provides zero-flicker, GPU-accelerated positioning.
 */
export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  editor,
  children,
  className = "",
  offset = 12,
  shouldShow,
  placement = "center",
}) => {
  const { ref, style, active } = useMenuPositioner({
    editor,
    extensionName: "bubbleMenu",
    type: "bubble",
    offset,
    placement,
  });

  useEffect(() => {
    if (!editor) return;

    // Register the bubble menu extension logic with the core
    const extension = BubbleMenuExtension.configure({
      shouldShow: shouldShow as any,
    });

    editor.registerExtension(extension);

    return () => {
      editor.unregisterExtension(extension.name);
    };
  }, [editor, shouldShow]);

  if (typeof document === "undefined" || !active) return null;

  return createPortal(
    <div ref={ref} style={style} className={className} data-arkpad-menu="true">
      {children}
    </div>,
    document.body
  );
};

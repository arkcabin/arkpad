import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { BubbleMenu as BubbleMenuExtension, ArkpadEditorAPI } from "@arkpad/core";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

export interface BubbleMenuProps {
  id?: string;
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
}

/**
 * BubbleMenu component that uses the high-performance CSS Variable positioning engine.
 */
export const BubbleMenu: React.FC<BubbleMenuProps> = ({
  id,
  editor,
  children,
  className = "",
  offset,
  shouldShow,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const extensionRef = useRef<ReturnType<typeof BubbleMenuExtension> | null>(null);

  useEffect(() => {
    if (!editor) return;

    const element = containerRef.current;
    if (!element) return;

    const extension = BubbleMenuExtension({
      id,
      editor,
      element,
      offset,
      shouldShow,
    });

    extensionRef.current = extension;
    editor.registerExtension(extension);

    return () => {
      if (extensionRef.current) {
        // Use ID for unregistration if provided, otherwise fallback to name (though name collision still possible without ID)
        editor.unregisterExtension(extensionRef.current.id || extensionRef.current.name);
        extensionRef.current = null;
      }
    };
  }, [editor, id]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div ref={containerRef} className={className}>
      {children}
    </div>,
    document.body
  );
};

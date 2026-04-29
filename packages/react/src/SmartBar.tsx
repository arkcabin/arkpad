import React from "react";
import { BubbleMenu } from "./BubbleMenu";
import { useArkpadContext } from "./context";
import { useEditorState } from "./useEditorState";
import { ArkpadEditorAPI } from "@arkpad/core";

export interface SmartBarProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
  /**
   * Custom visibility logic for the entire bar.
   * By default, it shows if there is a selection or if inside a table/image.
   */
  shouldShow?: (editor: ArkpadEditorAPI) => boolean;
}

export interface SmartBarGroupProps {
  children: React.ReactNode;
  /**
   * Logic to determine if this specific group should be visible.
   */
  showIf?: (editor: ArkpadEditorAPI) => boolean;
  className?: string;
}

/**
 * A group of items within the Smart Bar that only renders when a condition is met.
 */
export const SmartBarGroup: React.FC<SmartBarGroupProps> = ({
  children,
  showIf,
  className = "",
}) => {
  const editor = useArkpadContext();
  const visible = useEditorState(editor, (s) => (showIf ? showIf(s) : true));

  if (!visible) return null;

  return (
    <div className={`arkpad-smart-bar-group flex items-center gap-0.5 ${className}`}>
      {children}
    </div>
  );
};

/**
 * The SmartBar is an ultra-fast, contextual floating menu.
 * It uses a slot-based system to morph its content based on the editor state.
 */
const SmartBarComponent: React.FC<SmartBarProps> = ({
  children,
  className = "",
  shouldShow,
  offset,
}) => {
  const editor = useArkpadContext();

  const defaultShouldShow = (e: ArkpadEditorAPI) => {
    const state = e.getState();
    const selection = state.selection;
    // Show if there is a text selection OR if we are in a node that typically has floating tools
    return !selection.empty || e.isActive("table") || e.isActive("image");
  };

  return (
    <BubbleMenu
      editor={editor}
      offset={offset}
      className={`arkpad-smart-bar ${className}`}
      shouldShow={() => {
        if (!editor) return false;
        return shouldShow ? shouldShow(editor) : defaultShouldShow(editor);
      }}
    >
      <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl rounded-lg p-1">
        {children}
      </div>
    </BubbleMenu>
  );
};

export const SmartBar = Object.assign(SmartBarComponent, {
  Group: SmartBarGroup,
});

import React from "react";
import { SmartBar } from "../menus/SmartBar";
import { useArkpadContext } from "../editor/context";
import { ArkpadEditorAPI } from "@arkpad/core";

/**
 * StudioBubbleMenu - Floating surgical toolbar for page builder blocks.
 * Provides Duplicate, Delete, and Reorder actions for selected nodes.
 */
export const StudioBubbleMenu: React.FC = () => {
  const editor = useArkpadContext();

  if (!editor) return null;

  const handleAction = (command: string) => {
    editor.runCommand(command);
  };

  const shouldShow = (e: ArkpadEditorAPI) => {
    const state = e.getState();
    const { selection } = state;
    
    // Show if we have a node selection (selected Section, Grid, etc.)
    // or if the cursor is inside a layout-critical node
    return (selection as any).node || e.isActive("section") || e.isActive("grid") || e.isActive("container");
  };

  return (
    <SmartBar
      offset={0}
      placement="top-right"
      shouldShow={shouldShow}
      className="z-[100]"
    >
      <div className="flex items-center gap-0.5 p-1 bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-lg">
        {/* Duplicate */}
        <button
          onClick={() => handleAction("duplicateNode")}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-all text-neutral-500 hover:text-blue-500"
          title="Duplicate"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={() => handleAction("deleteNode")}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-all text-neutral-500 hover:text-red-500"
          title="Delete"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
          </svg>
        </button>

        <div className="w-[1px] h-4 bg-neutral-100 dark:bg-neutral-800 mx-1" />

        {/* Move Up */}
        <button
          onClick={() => handleAction("moveNodeUp")}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-all text-neutral-500 hover:text-blue-500"
          title="Move Up"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6"/>
          </svg>
        </button>

        {/* Move Down */}
        <button
          onClick={() => handleAction("moveNodeDown")}
          className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-md transition-all text-neutral-500 hover:text-blue-500"
          title="Move Down"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </button>
      </div>
    </SmartBar>
  );
};

import React, { ReactNode } from "react";
import { ArkpadProvider } from "../editor/context";
import { ArkpadEditorAPI } from "@arkpad/core";
import { cn } from "../../utils/utils";
import "./studio.css";

interface ArkpadStudioProps {
  editor: ArkpadEditorAPI | null;
  children: ReactNode;
  leftSidebar?: ReactNode;
  rightSidebar?: ReactNode;
  topBar?: ReactNode;
  className?: string;
  isSidebarOpen?: boolean;
  isPropertyPanelOpen?: boolean;
  previewMode?: boolean;
}

/**
 * ArkpadStudio - High-End Layout Orchestrator (Framer/Builder.io inspired).
 */
export function ArkpadStudio({
  editor,
  children,
  leftSidebar,
  rightSidebar,
  topBar,
  className,
  isSidebarOpen = true,
  isPropertyPanelOpen = false,
  previewMode = false,
}: ArkpadStudioProps) {
  return (
    <ArkpadProvider editor={editor}>
      <div
        className={cn(
          "flex flex-col h-full w-full overflow-hidden bg-[#F5F5F5] dark:bg-[#000000] text-neutral-900 dark:text-neutral-100",
          className
        )}
      >
        {topBar}

        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Block Library (Framer Sidebar) */}
          {!previewMode && leftSidebar && (
            <aside
              className={cn(
                "h-full border-r border-neutral-200 dark:border-neutral-900 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 bg-white dark:bg-[#0A0A0A]",
                isSidebarOpen ? "w-[280px]" : "w-0 opacity-0 overflow-hidden"
              )}
            >
              {leftSidebar}
            </aside>
          )}

          {/* Central Designing Stage */}
          <main className="flex-1 h-full flex flex-col relative overflow-hidden">{children}</main>

          {/* Right Property Panel (Framer Inspector) */}
          {!previewMode && rightSidebar && (
            <aside
              className={cn(
                "h-full border-l border-neutral-200 dark:border-neutral-900 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 bg-white dark:bg-[#0A0A0A]",
                isPropertyPanelOpen ? "w-[300px]" : "w-0 opacity-0 overflow-hidden"
              )}
            >
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </ArkpadProvider>
  );
}

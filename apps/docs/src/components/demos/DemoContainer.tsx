"use client";

import React from "react";
import { ArkpadProvider, ArkpadEditorContent } from "@arkpad/react";
import { ArkpadEditorAPI } from "@arkpad/core";

interface DemoContainerProps {
  editor: ArkpadEditorAPI | null;
  children?: React.ReactNode;
}


/**
 * A standardized container for Arkpad demos in the documentation.
 * Provides a premium look with the Emerald (Fumadocs) theme.
 */
export function DemoContainer({ editor, children }: DemoContainerProps) {
  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full border rounded-xl overflow-hidden bg-fd-background shadow-sm transition-all duration-300 hover:shadow-md border-fd-border/50">
        <div className="flex items-center gap-1.5 p-2.5 border-b bg-fd-secondary/20 border-fd-border/50">
          {children}
        </div>
        <div className="p-8 min-h-[180px] bg-fd-card/10">
          <ArkpadEditorContent 
            editor={editor} 
            className="prose dark:prose-invert max-w-none focus:outline-none arkpad-container" 
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

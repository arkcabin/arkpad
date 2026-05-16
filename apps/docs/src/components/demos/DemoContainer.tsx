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
      <div className="my-10 flex flex-col w-full border rounded-xl overflow-hidden bg-fd-background">
        {/* Minimalist Toolbar */}
        <div className="flex items-center border-b border-fd-border sticky top-0 z-10 bg-fd-background">
          {children}
        </div>


        {/* Full-width Editor */}
        <div className="flex-1">
          <ArkpadEditorContent
            editor={editor}
          />
        </div>
      </div>

    </ArkpadProvider>
  );
}



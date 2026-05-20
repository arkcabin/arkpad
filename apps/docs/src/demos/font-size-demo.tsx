"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { FontSize } from "@arkpad/extension-font-size";
import { Engine } from "@arkpad/core";

const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"];

export function FontSizeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, FontSize],
    content:
      '<p><span style="font-size: 24px">Large text</span> and <span style="font-size: 12px">small text</span>. Select text and click a size.</p>',
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 p-3 border-b bg-fd-secondary/30 flex-wrap">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => editor.runCommand("setFontSize", size)}
              className="text-xs px-3 py-1.5 text-fd-muted-foreground hover:text-fd-foreground border border-fd-border rounded cursor-pointer"
            >
              {size}
            </button>
          ))}
          <div className="w-px h-4 bg-fd-border mx-1" />
          <button
            onClick={() => editor.runCommand("unsetFontSize")}
            className="text-xs px-2 py-1 text-fd-muted-foreground hover:text-fd-foreground border border-fd-border rounded cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="arkpad-content-area focus:outline-none max-w-none"
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const fontSizeCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { FontSize } from "@arkpad/extension-font-size";
import { Engine } from "@arkpad/core";

export function FontSizeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, FontSize],
    content: "<p>Select text and change size.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <button onClick={() => editor.runCommand("setFontSize", "24px")}>24px</button>
      <button onClick={() => editor.runCommand("setFontSize", "12px")}>12px</button>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

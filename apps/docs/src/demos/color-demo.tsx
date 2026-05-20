"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { Color } from "@arkpad/extension-color";
import { Engine } from "@arkpad/core";

export function ColorDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Color],
    content:
      '<p><span style="color: #ef4444">Red text</span> and <span style="color: #3b82f6">blue text</span>. Highlight some text and click a color.</p>',
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 p-3 border-b bg-fd-secondary/30">
          {[
            { color: "#ef4444", label: "Red" },
            { color: "#3b82f6", label: "Blue" },
            { color: "#10b981", label: "Green" },
            { color: "#f59e0b", label: "Amber" },
            { color: "#8b5cf6", label: "Violet" },
          ].map(({ color, label }) => (
            <button
              key={color}
              onClick={() => editor.runCommand("setColor", color)}
              className="w-7 h-7 rounded border border-fd-border cursor-pointer"
              style={{ backgroundColor: color }}
              title={label}
            />
          ))}
          <div className="w-px h-4 bg-fd-border mx-1" />
          <button
            onClick={() => editor.runCommand("unsetColor")}
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

export const colorCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { Color } from "@arkpad/extension-color";
import { Engine } from "@arkpad/core";

export function ColorDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Color],
    content: "<p>Select text and apply color.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <button onClick={() => editor.runCommand("setColor", "#ef4444")}>Red</button>
      <button onClick={() => editor.runCommand("setColor", "#3b82f6")}>Blue</button>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

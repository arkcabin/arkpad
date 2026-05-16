"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { FontFamily } from "@arkpad/extension-font-family";
import { Engine } from "@arkpad/core";

export function FontFamilyDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, FontFamily],
    content:
      '<p><span style="font-family: serif">Serif text</span> and <span style="font-family: monospace">monospace text</span>. Select some text and click a font button.</p>',
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 p-3 border-b bg-fd-secondary/30 flex-wrap">
          {[
            { label: "Serif", value: "serif" },
            { label: "Sans", value: "sans-serif" },
            { label: "Mono", value: "monospace" },
            { label: "Georgia", value: "Georgia, serif" },
            { label: "Arial", value: "Arial, sans-serif" },
          ].map((font) => (
            <button
              key={font.value}
              onClick={() => editor.runCommand("setFontFamily", font.value)}
              className="text-xs px-3 py-1.5 text-fd-muted-foreground hover:text-fd-foreground border border-fd-border rounded cursor-pointer"
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </button>
          ))}
          <div className="w-px h-4 bg-fd-border mx-1" />
          <button
            onClick={() => editor.runCommand("unsetFontFamily")}
            className="text-xs px-2 py-1 text-fd-muted-foreground hover:text-fd-foreground border border-fd-border rounded cursor-pointer"
          >
            Clear
          </button>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="prose dark:prose-invert focus:outline-none max-w-none"
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const fontFamilyCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { FontFamily } from "@arkpad/extension-font-family";
import { Engine } from "@arkpad/core";

export function FontFamilyDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, FontFamily],
    content: "<p>Select text and change font.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <button onClick={() => editor.runCommand("setFontFamily", "serif")}>Serif</button>
      <button onClick={() => editor.runCommand("setFontFamily", "monospace")}>Mono</button>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

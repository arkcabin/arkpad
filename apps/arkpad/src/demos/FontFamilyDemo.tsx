import React from "react";
import { Engine } from "@arkpad/core";
import { FontFamily } from "@arkpad/extension-font-family";
import { Heading } from "@arkpad/extension-heading";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function FontFamilyDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, FontFamily],
    content:
      '<p><span style="font-family: serif">Serif text</span> and <span style="font-family: monospace">monospace text</span>. Select some text and click a font button.</p>',
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Style Extension"
      title="Font Family"
      description="Change the font family of selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-8 pt-4 pb-2 border-b border-[var(--border)] flex-wrap">
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
                className="text-xs px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] rounded cursor-pointer"
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            ))}
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <button
              onClick={() => editor.runCommand("unsetFontFamily")}
              className="text-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] rounded cursor-pointer"
            >
              Clear
            </button>
          </div>
          <div className="p-8">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

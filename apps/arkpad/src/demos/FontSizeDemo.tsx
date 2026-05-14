import React from "react";
import { Engine } from "@arkpad/core";
import { FontSize } from "@arkpad/extension-font-size";
import { Heading } from "@arkpad/extension-heading";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"];

export function FontSizeDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, FontSize],
    content:
      '<p><span style="font-size: 24px">Large text</span> and <span style="font-size: 12px">small text</span>. Select text and click a size.</p>',
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Style Extension"
      title="Font Size"
      description="Change the font size of selected text."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-8 pt-4 pb-2 border-b border-[var(--border)] flex-wrap">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => editor.runCommand("setFontSize", size)}
                className="text-xs px-3 py-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] rounded cursor-pointer"
              >
                {size}
              </button>
            ))}
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <button
              onClick={() => editor.runCommand("unsetFontSize")}
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

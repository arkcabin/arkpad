import React from "react";
import { Engine } from "@arkpad/core";
import { Color } from "@arkpad/extension-color";
import { Heading } from "@arkpad/extension-heading";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function ColorDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Color],
    content:
      "<p><span style=\"color: #ef4444\">Red text</span> and <span style=\"color: #3b82f6\">blue text</span>. Highlight some text and run <code>editor.runCommand('setColor', '#10b981')</code>.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Style Extension"
      title="Color"
      description="Apply text color to selected text. Supports hex, rgb, and named colors."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-8 pt-4 pb-2 border-b border-[var(--border)]">
            <button
              onClick={() => editor.runCommand("setColor", "#ef4444")}
              className="w-7 h-7 rounded bg-red-500 border border-[var(--border)] cursor-pointer"
              title="Red"
            />
            <button
              onClick={() => editor.runCommand("setColor", "#3b82f6")}
              className="w-7 h-7 rounded bg-blue-500 border border-[var(--border)] cursor-pointer"
              title="Blue"
            />
            <button
              onClick={() => editor.runCommand("setColor", "#10b981")}
              className="w-7 h-7 rounded bg-green-500 border border-[var(--border)] cursor-pointer"
              title="Green"
            />
            <button
              onClick={() => editor.runCommand("setColor", "#f59e0b")}
              className="w-7 h-7 rounded bg-amber-500 border border-[var(--border)] cursor-pointer"
              title="Amber"
            />
            <button
              onClick={() => editor.runCommand("setColor", "#8b5cf6")}
              className="w-7 h-7 rounded bg-violet-500 border border-[var(--border)] cursor-pointer"
              title="Violet"
            />
            <div className="w-px h-4 bg-[var(--border)] mx-1" />
            <button
              onClick={() => editor.runCommand("unsetColor")}
              className="text-xs px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)] rounded cursor-pointer"
              title="Remove color"
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

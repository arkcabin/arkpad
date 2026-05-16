"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { Typography } from "@arkpad/extension-typography";
import { Engine } from "@arkpad/core";
import { Ellipsis, Copyright, Minus, ArrowRight } from "lucide-react";

const replacements = [
  { icon: Minus, label: "--/---", char: "\u2014", title: "En dash (--), Em dash (---)" },
  {
    icon: Ellipsis,
    label: "...\u2192\u2026",
    char: "\u2026",
    title: "Ellipsis (... \u2192 \u2026)",
  },
  { icon: ArrowRight, label: "->\u2192\u2192", char: "\u2192", title: "Arrow (-> \u2192 \u2192)" },
  { icon: Copyright, label: "(c)\u2192\u00A9", char: "\u00A9", title: "Copyright" },
];

export function TypographyDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Typography],
    content:
      "<p>Type these patterns to see auto-replacement:</p><p><strong>Em dash:</strong> word---word</p><p><strong>Ellipsis:</strong> continuing...</p><p><strong>Arrows:</strong> type -> or <-</p><p><strong>Symbols:</strong> (c), (r), (tm)</p>",
  });

  if (!editor) return null;

  const insert = (char: string) => {
    const view = editor.getView();
    const { from } = view.state.selection;
    const tr = view.state.tr.insertText(char, from);
    view.dispatch(tr);
    view.focus();
  };

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          {replacements.map((r) => (
            <button
              key={r.char}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(r.char)}
              className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors"
              title={r.title}
            >
              {r.icon ? (
                <r.icon className="w-3.5 h-3.5" />
              ) : (
                <span className="text-xs">{r.label}</span>
              )}
            </button>
          ))}
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

export const typographyCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { Typography } from "@arkpad/extension-typography";
import { Engine } from "@arkpad/core";

export function TypographyDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Typography],
    content: "<p>Type (c), (r), tm, or ... to see auto-replacement.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

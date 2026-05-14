import React from "react";
import { Typography } from "@arkpad/extension-typography";
import { Bold } from "@arkpad/extension-bold";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";
import { Ellipsis, Copyright, Minus, ArrowRight } from "lucide-react";

const replacements = [
  {
    icon: Minus,
    label: "--\u2013/---\u2014",
    char: "\u2014",
    title: "En dash (--), Em dash (---)",
  },
  {
    icon: Ellipsis,
    label: "...\u2192\u2026",
    char: "\u2026",
    title: "Ellipsis (... \u2192 \u2026)",
  },
  { icon: ArrowRight, label: "->\u2192\u2192", char: "\u2192", title: "Arrow (-> \u2192 \u2192)" },
  { icon: Copyright, label: "(c)\u2192\u00A9", char: "\u00A9", title: "Copyright" },
  { icon: null, label: "+-\u2192\u00B1", char: "\u00B1", title: "Plus/minus" },
  { icon: null, label: "(r)\u2192\u00AE", char: "\u00AE", title: "Registered" },
  { icon: null, label: "(tm)\u2192\u2122", char: "\u2122", title: "Trademark" },
  { icon: null, label: "1/2\u2192\u00BD", char: "\u00BD", title: "Fraction 1/2" },
];

export function TypographyDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Bold, Typography],
    content:
      "<h1>Typography</h1><p>Type these patterns to see auto-replacement:</p><p><strong>En dash:</strong> word--word</p><p><strong>Em dash:</strong> word---word</p><p><strong>Ellipsis:</strong> continuing...</p><p><strong>Arrows:</strong> type -> or <- or => or <=</p><p><strong>Smart quotes:</strong> type \"hello\" or 'world'</p><p><strong>Fractions:</strong> type 1/2, 1/4, 3/4</p><p><strong>Symbols:</strong> (c), (r), (tm), !=, +-</p><p><br></p><p>Try typing above \u2014 the replacements happen instantly as you type.</p>",
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
    <ShowcaseLayout
      category="Utility Extension"
      title="Typography"
      description="Smart punctuation and symbols: dashes, arrows, fractions, smart quotes, and more auto-replace as you type."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center gap-1">
            {replacements.map((r) => (
              <button
                key={r.char}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insert(r.char)}
                className="toolbar-btn"
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

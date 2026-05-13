import React from "react";
import { Typography } from "@arkpad/extension-typography";
import { Bold } from "@arkpad/extension-bold";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";
import { Ellipsis, Copyright, Minus } from "lucide-react";

const replacements = [
  { icon: Minus, label: "-- → —", char: "—", title: "Em dash (-- → —)" },
  { icon: Ellipsis, label: "... → …", char: "…", title: "Ellipsis (... → …)" },
  { icon: Copyright, label: "(c) → ©", char: "©", title: "Copyright ((c) → ©)" },
  { icon: null, label: "(r)", char: "®", title: "Registered" },
  { icon: null, label: "(tm)", char: "™", title: "Trademark" },
];

export function TypographyDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, Bold, Typography],
    content:
      "<h1>Typography</h1><p>Type the following patterns to see automatic replacement:</p><p><strong>Em dash:</strong> word--word</p><p><strong>Ellipsis:</strong> continuing...</p><p><strong>Copyright:</strong> (c) 2024</p><p><strong>Registered:</strong> (r)</p><p><strong>Trademark:</strong> (tm)</p><p><br></p><p>Try it yourself above — type <code>--</code>, <code>...</code>, <code>(c)</code>, <code>(r)</code>, or <code>(tm)</code> directly in this paragraph.</p>",
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
      description="Smart punctuation that auto-replaces as you type: em dashes, ellipsis, copyright, registered, and trademark symbols."
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

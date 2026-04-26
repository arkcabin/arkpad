import React, { useState } from "react";

import { type ArkpadEditorAPI } from "@arkpad/core";
import { ArkpadEditorComponent } from "@arkpad/react";

export function App() {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);
  const [html, setHtml] = useState("<p>Welcome to Arkpad.</p>");

  const run = (command: string, value?: any) => {
    if (!editor) return;
    if (value) {
      (editor as any).runCommand(command, value);
    } else {
      editor.runCommand(command);
    }
    editor.focus();
  };

  return (
    <main className="page">
      <section className="panel">
        <h1>Arkpad</h1>
        <p className="subtitle">A TipTap-style editor built on ProseMirror.</p>

        <div className="toolbar">
          <button onClick={() => run("toggleBold")} type="button">Bold</button>
          <button onClick={() => run("toggleItalic")} type="button">Italic</button>
          <button onClick={() => run("toggleStrike")} type="button">Strike</button>
          <button onClick={() => run("toggleCode")} type="button">Code</button>
          <span className="separator" />
          <button onClick={() => run("setHeading1")} type="button">H1</button>
          <button onClick={() => run("setHeading2")} type="button">H2</button>
          <button onClick={() => run("setHeading3")} type="button">H3</button>
          <button onClick={() => run("setHeading4")} type="button">H4</button>
          <button onClick={() => run("setHeading5")} type="button">H5</button>
          <button onClick={() => run("setHeading6")} type="button">H6</button>
          <button onClick={() => run("setParagraph")} type="button">P</button>
          <span className="separator" />
          <button onClick={() => run("setBlockquote")} type="button">Quote</button>
          <button onClick={() => run("toggleCodeBlock")} type="button">Code Block</button>
          <span className="separator" />
          <button onClick={() => run("toggleBulletList")} type="button">Bullet List</button>
          <button onClick={() => run("toggleOrderedList")} type="button">Ordered List</button>
          <span className="separator" />
          <button onClick={() => run("setHorizontalRule")} type="button">HR</button>
          <button onClick={() => run("setHardBreak")} type="button">BR</button>
          <span className="separator" />
          <button onClick={() => run("undo")} type="button">Undo</button>
          <button onClick={() => run("redo")} type="button">Redo</button>
        </div>

        <ArkpadEditorComponent
          className="editor"
          content={html}
          onReady={(instance: ArkpadEditorAPI) => setEditor(instance)}
          onChange={({ html: nextHtml }: { html: string }) => setHtml(nextHtml)}
        />
      </section>

      <section className="panel">
        <h2>HTML Output</h2>
        <pre>{html}</pre>
      </section>
    </main>
  );
}
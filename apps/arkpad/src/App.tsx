import React, { useState } from "react";

import { type ArkpadEditorAPI } from "@arkpad/core";
import { ArkpadEditorComponent } from "@arkpad/react";

export function App() {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);
  const [html, setHtml] = useState("<p>Welcome to Arkpad.</p>");

  const run = (command: string) => {
    if (!editor) {
      return;
    }
    editor.runCommand(command);
    editor.focus();
  };

  return (
    <main className="page">
      <section className="panel">
        <h1>Arkpad</h1>
        <p className="subtitle">A legal Tiptap-style editor foundation built on ProseMirror.</p>

        <div className="toolbar">
          <button onClick={() => run("toggleBold")} type="button">Bold</button>
          <button onClick={() => run("toggleItalic")} type="button">Italic</button>
          <button onClick={() => run("toggleHeading")} type="button">H1</button>
          <button onClick={() => run("setParagraph")} type="button">P</button>
          <button onClick={() => run("toggleBlockquote")} type="button">Quote</button>
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
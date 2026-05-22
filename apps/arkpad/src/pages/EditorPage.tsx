import { ArkpadProvider, useArkpadEditor } from "@arkpad/react";
import React from "react";
import { TopNav } from "../components/navigation/TopNav";
import { EditorBubbleMenu } from "../features/editor/components/EditorBubbleMenu";
import { EditorCanvas } from "../features/editor/components/EditorCanvas";
import { EditorToolbar } from "../features/editor/components/EditorToolbar";
import { editorExtensions } from "../features/editor/config/editorExtensions";
import { usePersistentEditorContent } from "../features/editor/hooks/usePersistentEditorContent";

export function EditorPage() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const { content, persistContent } = usePersistentEditorContent();

  const editor = useArkpadEditor({
    extensions: editorExtensions,
    content,
    editable: true,
    autofocus: true,
    onUpdate: ({ editor: currentEditor }) => {
      persistContent(currentEditor.getHTML());
    },
  });

  if (!editor) {
    return (
      <main className={`editor-app ${theme}`}>
        <header className="editor-topbar">
          <p className="app-title">Arkpad</p>
          <TopNav />
        </header>
        <p className="loader-text">Loading editor...</p>
      </main>
    );
  }

  return (
    <ArkpadProvider editor={editor}>
      <main className={`editor-app ${theme}`}>
        <header className="editor-topbar">
          <div className="editor-actions">
            <TopNav />
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </header>

        <section className="editor-workspace">
          <EditorToolbar />
          <EditorBubbleMenu editor={editor} />
          <EditorCanvas editor={editor} />
        </section>
      </main>
    </ArkpadProvider>
  );
}

import { useState } from "react";
import { Engine } from "@arkpad/core";
import { Youtube } from "@arkpad/extension-youtube";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function YouTubeDemo() {
  const [url, setUrl] = useState("https://youtu.be/dQw4w9WgXcQ");

  const editor = useArkpadEditor({
    extensions: [Engine, Youtube],
    content: `<p>Paste a YouTube URL below or click Insert to embed:</p>`,
  });

  if (!editor) return null;

  const insertVideo = () => {
    editor.runCommand("setYoutubeVideo", { src: url });
    editor.getView().focus();
  };

  return (
    <ShowcaseLayout
      category="Rich Content"
      title="YouTube"
      description="Embed YouTube videos in your document. Paste a URL or type it in the input below."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-8 pt-4 pb-3 border-b border-[var(--border)]">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL..."
              className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-alt)] border border-[var(--border)] rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-[var(--text-main)]"
            />
            <button
              onClick={insertVideo}
              className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
            >
              Insert Video
            </button>
          </div>
          <div className="p-8">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
          <div className="px-8 pb-4 text-xs text-[var(--text-muted)]">
            <p>Hint: Paste a YouTube URL directly into the editor to auto-embed.</p>
          </div>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

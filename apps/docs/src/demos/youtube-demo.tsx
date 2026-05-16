"use client";

import React, { useState } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { Youtube } from "@arkpad/extension-youtube";
import { Engine } from "@arkpad/core";

export function YouTubeDemo() {
  const [url, setUrl] = useState("https://youtu.be/dQw4w9WgXcQ");

  const editor = useArkpadEditor({
    extensions: [Engine, Youtube],
    content: "<p>Paste a YouTube URL below or click Insert to embed:</p>",
  });

  if (!editor) return null;

  const insertVideo = () => {
    editor.runCommand("setYoutubeVideo", { src: url });
    editor.getView().focus();
  };

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-2 p-3 border-b bg-fd-secondary/30">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste YouTube URL..."
            className="flex-1 px-3 py-1.5 text-sm bg-fd-background border border-fd-border rounded focus:outline-none focus:ring-1 focus:ring-fd-ring"
          />
          <button
            onClick={insertVideo}
            className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors cursor-pointer"
          >
            Insert Video
          </button>
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="prose dark:prose-invert focus:outline-none max-w-none"
          />
        </div>
        <div className="px-6 pb-4 text-xs text-fd-muted-foreground">
          <p>Hint: Paste a YouTube URL directly into the editor to auto-embed.</p>
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const youTubeCode = `
import React, { useState } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { Youtube } from "@arkpad/extension-youtube";
import { Engine } from "@arkpad/core";

export function YouTubeDemo() {
  const [url, setUrl] = useState("");
  const editor = useArkpadEditor({
    extensions: [Engine, Youtube],
    content: "<p>Embed YouTube videos.</p>",
  });

  const insertVideo = () => {
    editor.runCommand("setYoutubeVideo", { src: url });
  };

  return (
    <ArkpadProvider editor={editor}>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube URL" />
      <button onClick={insertVideo}>Insert</button>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

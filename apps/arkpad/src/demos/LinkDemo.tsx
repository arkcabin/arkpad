import React, { useState, useEffect, useRef } from "react";
import { Link as LinkExtension } from "@arkpad/extension-link";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import {
  useArkpadEditor,
  ArkpadEditorContent,
  ArkpadProvider,
  LinkBubble,
  useSelection,
} from "@arkpad/react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function LinkDemo() {
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const linkClickRef = useRef(false);

  const editor = useArkpadEditor({
    extensions: [Engine, Heading, LinkExtension],
    content:
      '<h1>Hyperlinks</h1><p>This editor supports <a href="https://arkpad.dev">clickable hyperlinks</a>. Select any text and click the link button or press Mod+K to add or edit a link.</p><p>Try clicking on an existing link like <a href="https://example.com">this one</a> to edit it — or select any text and use the toolbar button to add a new link.</p>',
  });

  const selection = useSelection(editor);

  useEffect(() => {
    if (selection.empty && !linkClickRef.current) setLinkInputVisible(false);
    linkClickRef.current = false;
  }, [selection.empty]);

  useEffect(() => {
    if (!editor) return;
    const view = editor.getView();
    const dom = view.dom;
    const handler = (e: MouseEvent) => {
      const linkEl = (e.target as HTMLElement).closest("a[href]");
      if (!linkEl) return;
      e.preventDefault();
      linkClickRef.current = true;
      setLinkInputVisible(true);
    };
    dom.addEventListener("click", handler);
    return () => dom.removeEventListener("click", handler);
  }, [editor]);

  if (!editor) return null;

  const handleLinkClick = () => {
    if (selection.empty) return;
    editor.focus();
    setLinkInputVisible((v) => !v);
  };

  return (
    <ShowcaseLayout
      category="Mark Extension"
      title="Link"
      description="Add clickable hyperlinks to your text. Select text, click the link button, and enter a URL."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center gap-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleLinkClick}
              disabled={selection.empty}
              className={`toolbar-btn ${selection.isLink ? "active" : ""}`}
              title="Add Link"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </button>
          </div>
          <div className="p-8">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
          <LinkBubble
            editor={editor}
            visible={linkInputVisible}
            onClose={() => setLinkInputVisible(false)}
          />
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

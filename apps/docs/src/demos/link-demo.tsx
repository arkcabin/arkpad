"use client";

import React, { useState, useEffect, useRef } from "react";
import { useArkpadEditor, LinkBubble, useSelection } from "@arkpad/react";
import { Link as LinkExtension } from "@arkpad/extension-link";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Link as LinkIcon } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

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

  const handleLinkClick = () => {
    if (selection.empty) return;
    editor?.focus();
    setLinkInputVisible((v) => !v);
  };

  return (
    <DemoContainer editor={editor}>
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleLinkClick}
        disabled={selection.empty}
        className={`p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors ${
          selection.isLink ? "bg-fd-primary text-fd-primary-foreground" : ""
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
      {editor && (
        <LinkBubble
          editor={editor}
          visible={linkInputVisible}
          onClose={() => setLinkInputVisible(false)}
        />
      )}
    </DemoContainer>
  );
}

export const linkCode = `
import React, { useState, useEffect, useRef } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, LinkBubble, useSelection } from "@arkpad/react";
import { Link } from "@arkpad/extension-link";
import { Engine } from "@arkpad/core";
import { Link as LinkIcon } from "lucide-react";

export function LinkDemo() {
  const [linkInputVisible, setLinkInputVisible] = useState(false);
  const editor = useArkpadEditor({
    extensions: [Engine, Link],
    content: '<p>Click <a href="https://arkpad.dev">this link</a>.</p>',
  });

  const selection = useSelection(editor);

  const handleLinkClick = () => {
    if (selection.empty) return;
    setLinkInputVisible(true);
  };

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 border-b bg-muted/50">
          <button 
            onClick={handleLinkClick}
            disabled={selection.empty}
            className="p-2 hover:bg-accent rounded"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          <ArkpadEditorContent editor={editor} />
        </div>
        {editor && (
          <LinkBubble
            editor={editor}
            visible={linkInputVisible}
            onClose={() => setLinkInputVisible(false)}
          />
        )}
      </div>
    </ArkpadProvider>
  );
}`;

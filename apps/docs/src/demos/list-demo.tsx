"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { Engine } from "@arkpad/core";
import { List, ListOrdered, Indent, Outdent } from "lucide-react";

export function ListDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, BulletList, OrderedList],
    content: `
      <p>The list extension supports both bulleted and numbered lists with nesting.</p>
      <ul>
        <li><p>Standard Bullet Item</p></li>
        <li><p>Another Item</p></li>
      </ul>
      <ol>
        <li><p>First Step</p></li>
        <li><p>Second Step</p></li>
      </ol>
    `,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30">
          <EditorButton
            command="toggleBulletList"
            name="bulletList"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </EditorButton>
          <EditorButton
            command="toggleOrderedList"
            name="orderedList"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
            activeClassName="active"
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </EditorButton>
          <div className="w-px h-4 bg-fd-border mx-1" />
          <EditorButton
            command="sinkListItem"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors disabled:opacity-30"
            title="Indent"
          >
            <Indent className="w-4 h-4" />
          </EditorButton>
          <EditorButton
            command="liftListItem"
            className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors disabled:opacity-30"
            title="Outdent"
          >
            <Outdent className="w-4 h-4" />
          </EditorButton>
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

export const listCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { BulletList, OrderedList } from "@arkpad/extension-list";
import { Engine } from "@arkpad/core";
import { List, ListOrdered } from "lucide-react";

export function ListDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, BulletList, OrderedList],
    content: "<ul><li><p>Item</p></li></ul>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex items-center gap-1 p-2 border-b">
        <EditorButton command="toggleBulletList" name="bulletList">
          <List className="w-4 h-4" />
        </EditorButton>
        <EditorButton command="toggleOrderedList" name="orderedList">
          <ListOrdered className="w-4 h-4" />
        </EditorButton>
      </div>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

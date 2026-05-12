import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { List, ListOrdered, Indent, Outdent } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function ListDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, BulletList, OrderedList],
    content: `
      <h1>Lists</h1>
      <p>The list extension supports both bulleted and numbered lists with full support for nesting and indentation.</p>
      <ul>
        <li>
          <p>Standard Bullet Item</p>
          <ul>
            <li><p>Nested Level 2</p></li>
            <li><p>Another Nested Item</p></li>
          </ul>
        </li>
        <li><p>Back to Level 1</p></li>
      </ul>
      <ol>
        <li><p>First Step</p></li>
        <li>
          <p>Second Step</p>
          <ol>
            <li><p>Sub-step A</p></li>
          </ol>
        </li>
      </ol>
      <p>Use <strong>Tab</strong> to indent and <strong>Shift+Tab</strong> to outdent list items.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="Lists"
      description="Bulleted and numbered lists with nesting support."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center gap-1">
            <EditorButton
              command="toggleBulletList"
              name="bulletList"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </EditorButton>

            <EditorButton
              command="toggleOrderedList"
              name="orderedList"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Ordered List"
            >
              <ListOrdered className="w-4 h-4" />
            </EditorButton>

            <div className="w-px h-4 bg-[var(--border)] mx-1" />

            <EditorButton
              command="sinkListItem"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-30"
              title="Indent (Tab)"
            >
              <Indent className="w-4 h-4" />
            </EditorButton>

            <EditorButton
              command="liftListItem"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-30"
              title="Outdent (Shift+Tab)"
            >
              <Outdent className="w-4 h-4" />
            </EditorButton>
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

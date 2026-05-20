import { Engine } from "@arkpad/core";
import {
  useArkpadEditor,
  ArkpadEditorContent,
  ArkpadProvider,
  FloatingMenu,
  EditorButton,
  DropdownMenu,
} from "@arkpad/react";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Underline } from "@arkpad/extension-underline";
import { Strike } from "@arkpad/extension-strike";
import { Code } from "@arkpad/extension-code";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { ListItem } from "@arkpad/extension-list-item";
import { Link } from "@arkpad/extension-link";
import { Highlight } from "@arkpad/extension-highlight";
import { createTextAlign } from "@arkpad/extension-alignment";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function FloatingMenuDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Bold,
      Italic,
      Underline,
      Strike,
      Code,
      Heading,
      Blockquote,
      BulletList,
      OrderedList,
      ListItem,
      Link,
      Highlight,
      createTextAlign(),
    ],
    content: `
      <h1>Floating Menu Demo</h1>
      <p>Click inside an empty paragraph below to see the floating menu appear at the cursor position.</p>
      <p></p>
      <p>The floating menu provides quick access to formatting options right where you're typing.</p>
      <p></p>
      <h2>How it works</h2>
      <p>The floating menu appears at the start of an empty paragraph when the cursor is focused. It gives you access to essential formatting tools without moving your mouse to a toolbar.</p>
      <p></p>
      <h2>Features</h2>
      <ul>
        <li><strong>Context-Aware</strong> — Appears when you need it, disappears when you don't.</li>
        <li><strong>Inline Positioning</strong> — Anchored to the cursor position for natural editing flow.</li>
        <li><strong>Customizable</strong> — Pass your own children to create any toolbar layout.</li>
        <li><strong>Zero-Flicker</strong> — GPU-accelerated, RAF-synced positioning like the Bubble Menu.</li>
      </ul>
      <p>Try clicking in one of the empty paragraphs above to see the floating menu in action.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Interaction"
      title="Floating Menu"
      description="An inline toolbar that appears at the cursor when typing in an empty paragraph."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col bg-[var(--bg-main)] relative">
          <div className="p-8 sm:p-16">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert focus:outline-none arkpad-container"
            />
          </div>
          <FloatingMenu editor={editor}>
            <div className="flex items-center gap-0.5 px-2 py-1.5 bg-[var(--menu-bg)] rounded-lg shadow-lg border border-[var(--menu-border)]">
              <EditorButton
                command="toggleBold"
                name="bold"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                  <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                </svg>
              </EditorButton>
              <EditorButton
                command="toggleItalic"
                name="italic"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" x2="10" y1="4" y2="4" />
                  <line x1="14" x2="5" y1="20" y2="20" />
                  <line x1="15" x2="9" y1="4" y2="20" />
                </svg>
              </EditorButton>
              <EditorButton
                command="toggleUnderline"
                name="underline"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 4v6a6 6 0 0 0 12 0V4" />
                  <line x1="4" x2="20" y1="20" y2="20" />
                </svg>
              </EditorButton>
              <EditorButton
                command="toggleStrike"
                name="strike"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4H9a3 3 0 0 0-2.83 4" />
                  <path d="M14 12a4 4 0 0 1 0 8H6" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                </svg>
              </EditorButton>
              <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
              <DropdownMenu layout="vertical">
                <DropdownMenu.Trigger className="toolbar-btn text-[10px] font-bold px-1 min-w-[20px] gap-0.5">
                  H<span className="text-[8px] opacity-60">▾</span>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="start" side="top" minWidth={140}>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <DropdownMenu.Item
                      key={level}
                      command="toggleHeading"
                      name="heading"
                      attrs={{ level }}
                    >
                      <span className="font-semibold text-[var(--menu-dim-text)] mr-2 w-5 text-right">
                        H{level}
                      </span>
                      <span>Heading {level}</span>
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item command="setParagraph" name="paragraph">
                    <span className="text-[var(--menu-dim-text)] mr-2 w-5 text-right font-mono">
                      ¶
                    </span>
                    <span>Paragraph</span>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu>
              <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
              <EditorButton
                command="toggleCode"
                name="code"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </EditorButton>
              <EditorButton
                command="toggleBlockquote"
                name="blockquote"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                  <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                </svg>
              </EditorButton>
              <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
              <EditorButton
                command="toggleBulletList"
                name="bulletList"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
              </EditorButton>
              <EditorButton
                command="toggleOrderedList"
                name="orderedList"
                className="toolbar-btn"
                activeClassName="active"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="10" x2="21" y1="6" y2="6" />
                  <line x1="10" x2="21" y1="12" y2="12" />
                  <line x1="10" x2="21" y1="18" y2="18" />
                  <path d="M4 6h1v4" />
                  <path d="M4 10h2" />
                  <path d="M6 18H4c0-1 .5-2 2-2 .7 0 1.3.3 1.3.7s-.3.7-1.3 1.3l-1.7.7" />
                </svg>
              </EditorButton>
              <div className="w-px h-4 bg-[var(--menu-separator)] mx-1" />
              <EditorButton
                command="setTextAlign"
                name="textAlign"
                className="toolbar-btn"
                activeClassName="active"
                args={["left"]}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="3" x2="15" y1="12" y2="12" />
                  <line x1="3" x2="18" y1="18" y2="18" />
                </svg>
              </EditorButton>
              <EditorButton
                command="setTextAlign"
                name="textAlign"
                className="toolbar-btn"
                activeClassName="active"
                args={["center"]}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="5" x2="19" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              </EditorButton>
              <EditorButton
                command="setTextAlign"
                name="textAlign"
                className="toolbar-btn"
                activeClassName="active"
                args={["right"]}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" x2="21" y1="6" y2="6" />
                  <line x1="9" x2="21" y1="12" y2="12" />
                  <line x1="6" x2="21" y1="18" y2="18" />
                </svg>
              </EditorButton>
            </div>
          </FloatingMenu>
        </div>
      </ArkpadProvider>
    </ShowcaseLayout>
  );
}

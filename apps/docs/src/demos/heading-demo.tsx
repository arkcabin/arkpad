"use client";

import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Heading1, Heading2, Heading3 } from "lucide-react";

const Heading4 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 10l3 5v2h-3" />
    <path d="M21 15h-4" />
  </svg>
);

const Heading5 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 13v-3h4" />
    <path d="M17 17a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3" />
  </svg>
);

const Heading6 = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <circle cx="19" cy="16" r="3" />
    <path d="M22 13a3 3 0 0 0-3-3 3 3 0 0 0-3 3" />
  </svg>
);

export function HeadingDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading],
    content: `
      <h1>Project Arkpad: The Future of Editing</h1>
      <p>Welcome to the next generation of content creation.</p>
      <h2>Executive Summary</h2>
      <p>Our goal is to provide a surgical editing interface.</p>
      <h3>Core Technologies</h3>
      <p>Built on top of ProseMirror and React.</p>
      <h4>Heading Transitions</h4>
      <p>Support for H1 through H6 with custom typography.</p>
    `,
    autofocus: true,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-1 p-2 border-b bg-fd-secondary/30 overflow-x-auto">
          {[1, 2, 3, 4, 5, 6].map((level) => {
            const Icon = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6][level - 1]!;
            return (
              <EditorButton
                key={level}
                command="toggleHeading"
                args={[{ level }]}
                name={`h${level}`}
                attrs={{ level }}
                className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
                activeClassName="active"
                title={`H${level}`}
              >
                <Icon className="w-4 h-4" />
              </EditorButton>
            );
          })}
        </div>
        <div className="p-6 min-h-[150px]">
          <ArkpadEditorContent
            editor={editor}
            className="prose dark:prose-invert focus:outline-none max-w-none"
          />
        </div>
      </div>
    </ArkpadProvider>
  );
}

export const headingCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Heading } from "@arkpad/extension-heading";
import { Heading1, Heading2, Heading3 } from "lucide-react";

export function HeadingDemo() {
  const editor = useArkpadEditor({
    extensions: [Heading],
    content: "<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex items-center gap-1 p-2 border-b">
        {[1, 2, 3].map((level) => (
          <EditorButton
            key={level}
            command="toggleHeading"
            args={[{ level }]}
            name={\`h\${level}\`}
            attrs={{ level }}
          >
            <Icon className="w-4 h-4" />
          </EditorButton>
        ))}
      </div>
      <ArkpadEditorContent editor={editor} />
    </ArkpadProvider>
  );
}`;

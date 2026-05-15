"use client";

import { useArkpadEditor, ArkpadEditorContent } from "@arkpad/react";
import StarterKit from "@arkpad/starter-kit";
import { cn } from "@/lib/cn";
import type { ArkpadEditorAPI } from "@arkpad/core";

interface PlaygroundProps {
  content?: string;
  showToolbar?: boolean;
}

function Toolbar({ editor }: { editor: ArkpadEditorAPI }) {
  if (!editor) return null;

  const Button = ({
    command,
    args,
    isActive,
    children,
  }: {
    command: string;
    args?: unknown;
    isActive?: string | Record<string, unknown>;
    children: React.ReactNode;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const active = isActive ? editor.isActive(isActive as any, args as any) : false;
    return (
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.runCommand(command, args);
        }}
        className={cn(
          "px-2 py-1 text-xs rounded transition-colors",
          active
            ? "bg-blue-500 text-white"
            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        )}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 dark:bg-gray-800">
      <Button command="toggleBold" isActive="strong">
        B
      </Button>
      <Button command="toggleItalic" isActive="em">
        <em>I</em>
      </Button>
      <Button command="toggleUnderline" isActive="underline">
        <u>U</u>
      </Button>
      <Button command="toggleStrike" isActive="strike">
        <s>S</s>
      </Button>
      <span className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button command="toggleCode" isActive="code">
        {"<>"}
      </Button>
      <Button command="toggleSuperscript" isActive="superscript">
        x²
      </Button>
      <Button command="toggleSubscript" isActive="subscript">
        x₂
      </Button>
      <span className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button command="toggleHeading" args={{ level: 1 }} isActive="h1">
        H1
      </Button>
      <Button command="toggleHeading" args={{ level: 2 }} isActive="h2">
        H2
      </Button>
      <Button command="toggleHeading" args={{ level: 3 }} isActive="h3">
        H3
      </Button>
      <span className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button command="toggleBulletList" isActive="bulletList">
        • List
      </Button>
      <Button command="toggleOrderedList" isActive="orderedList">
        1. List
      </Button>
      <Button command="toggleTaskList" isActive="taskList">
        ☑ Tasks
      </Button>
      <Button command="toggleBlockquote" isActive="blockquote">
        ❞ Quote
      </Button>
      <span className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button command="setTextAlign" args={["left"]} isActive="textAlign">
        ≡ L
      </Button>
      <Button command="setTextAlign" args={["center"]} isActive="textAlign">
        ≡ C
      </Button>
      <Button command="setTextAlign" args={["right"]} isActive="textAlign">
        ≡ R
      </Button>
      <span className="w-px bg-gray-300 dark:bg-gray-600 mx-1" />
      <Button command="undo">↩</Button>
      <Button command="redo">↪</Button>
    </div>
  );
}

export function Playground({
  content = "<p>Start editing...</p>",
  showToolbar = true,
}: PlaygroundProps) {
  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content,
  });

  return (
    <div className="rounded-xl border overflow-hidden my-6">
      {showToolbar && editor && <Toolbar editor={editor} />}
      <div className="p-4 min-h-[200px] bg-white dark:bg-gray-900 prose-sm max-w-none">
        {editor && <ArkpadEditorContent editor={editor} />}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Engine, ArkpadExtension } from "@arkpad/core";
import { Bold } from "@arkpad/extension-bold";
import { Italic } from "@arkpad/extension-italic";
import { Underline } from "@arkpad/extension-underline";
import { Strike } from "@arkpad/extension-strike";
import { Code } from "@arkpad/extension-code";
import { Highlight } from "@arkpad/extension-highlight";
import { Superscript } from "@arkpad/extension-superscript";
import { Subscript } from "@arkpad/extension-subscript";
import { Link } from "@arkpad/extension-link";
import { Heading } from "@arkpad/extension-heading";
import { Blockquote } from "@arkpad/extension-blockquote";
import { BulletList } from "@arkpad/extension-bullet-list";
import { OrderedList } from "@arkpad/extension-ordered-list";
import { TaskList } from "@arkpad/extension-task-list";
import { Table } from "@arkpad/extension-table";
import { Image } from "@arkpad/extension-image";




const extensionMap: Record<string, ArkpadExtension[]> = {
  bold: [Engine, Bold],
  italic: [Engine, Italic],
  underline: [Engine, Underline],
  strike: [Engine, Strike],
  code: [Engine, Code],
  highlight: [Engine, Highlight],
  superscript: [Engine, Superscript],
  subscript: [Engine, Subscript],
  link: [Engine, Link],
  heading: [Engine, Heading],
  blockquote: [Engine, Blockquote],
  list: [Engine, BulletList, OrderedList],
  "bullet-list": [Engine, BulletList],
  "ordered-list": [Engine, OrderedList],
  "task-list": [Engine, TaskList],
  table: [Engine, Table],
  image: [Engine, Image],
};



interface DemoCommand {
  label: string;
  command: string;
  args?: unknown;
  isActive?: string | [string, Record<string, unknown>];
}

interface FeatureDemoProps {
  feature: string;
  content: string;
  commands?: DemoCommand[];
  code?: string;
  fullCode?: string;
}

export function FeatureDemo({ feature, content, commands, code, fullCode }: FeatureDemoProps) {
  const [view, setView] = useState<"preview" | "code">("preview");
  const extensions = (extensionMap[feature] || [Engine]) as ArkpadExtension[];
  const editor = useArkpadEditor({ extensions, content });

  const displayCode = fullCode || code || "";

  return (
    <div className="rounded-xl border bg-fd-card my-6 overflow-hidden not-prose shadow-sm flex flex-col">
      <div className="flex border-b bg-fd-muted/30">
        <button
          onClick={() => setView("preview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "preview"
              ? "text-fd-primary border-b-2 border-fd-primary -mb-[1px]"
              : "text-fd-muted-foreground hover:text-fd-foreground"
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setView("code")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            view === "code"
              ? "text-fd-primary border-b-2 border-fd-primary -mb-[1px]"
              : "text-fd-muted-foreground hover:text-fd-foreground"
          }`}
        >
          Code
        </button>
      </div>

      <div className="flex-1">
        {view === "preview" ? (
          <div className="flex flex-col w-full h-full">
            {commands && commands.length > 0 && editor && (
              <ArkpadProvider editor={editor}>
                <div className="flex flex-wrap gap-1 p-2 border-b bg-fd-secondary/50">
                  {commands.map((cmd) => {
                    const activeName = Array.isArray(cmd.isActive) ? cmd.isActive[0] : cmd.isActive;
                    const activeAttrs = Array.isArray(cmd.isActive) ? cmd.isActive[1] : undefined;
                    return (
                      <EditorButton
                        key={cmd.label}
                        command={cmd.command}
                        args={cmd.args !== undefined ? [cmd.args] : undefined}
                        name={activeName}
                        attrs={activeAttrs}
                        className="px-2.5 py-1 text-xs rounded-md font-medium hover:bg-fd-accent text-fd-muted-foreground [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
                        activeClassName="active"
                      >
                        {cmd.label}
                      </EditorButton>
                    );
                  })}
                </div>
              </ArkpadProvider>
            )}
            <div className="p-6 md:p-10 min-h-[200px] bg-fd-background/50 flex justify-center">
              <div className="w-full max-w-[700px] border shadow-sm rounded-lg bg-fd-background p-6">
                {editor && (
                  <ArkpadEditorContent
                    editor={editor}
                    className="prose dark:prose-invert max-w-none focus:outline-none"
                  />
                )}

              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-fd-muted overflow-auto max-h-[600px]">
            <pre className="text-xs font-mono whitespace-pre">
              <code>{displayCode}</code>
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}





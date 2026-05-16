"use client";

import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { AI } from "@arkpad/extension-ai";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Sparkles, TextSelect } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

export function AIDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Heading,
      AI.configure({
        onAIRequest: async ({ command }) => {
          await new Promise((r) => setTimeout(r, 300));
          if (command === "complete")
            return " This is AI-generated text. Configure a real AI handler to replace this mock.";
          if (command === "summarize") return "Summary: This is a mock AI summary response.";
          return "Mock AI response.";
        },
      }),
    ],
    content:
      "<h1>AI Assistant</h1><p>This extension provides AI-powered autocomplete and summarization. Select text and click Summarize, or place your cursor and click Complete to see a mock response.</p>",
  });

  return (
    <DemoContainer editor={editor}>
      <EditorButton
        command="aiComplete"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
        title="AI Complete"
      >
        <Sparkles className="w-4 h-4" />
      </EditorButton>
      <EditorButton
        command="aiSummarize"
        className="p-2 rounded hover:bg-fd-accent text-fd-muted-foreground transition-colors [&.active]:bg-fd-primary [&.active]:text-fd-primary-foreground"
        title="AI Summarize"
      >
        <TextSelect className="w-4 h-4" />
      </EditorButton>
    </DemoContainer>
  );
}

export const aiCode = `
import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { AI } from "@arkpad/extension-ai";
import { Engine } from "@arkpad/core";
import { Sparkles } from "lucide-react";

export function AIDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      AI.configure({
        onAIRequest: async ({ command }) => {
          // Implement your AI provider here
          return "AI response";
        },
      }),
    ],
    content: "<p>Try AI complete or summarize.</p>",
  });

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex flex-col border rounded-lg overflow-hidden">
        <div className="p-2 border-b bg-muted/50">
          <EditorButton command="aiComplete">
            <Sparkles className="w-4 h-4" />
          </EditorButton>
        </div>
        <div className="p-4">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
}`;


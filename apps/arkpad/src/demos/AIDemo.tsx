import { AI } from "@arkpad/extension-ai";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Sparkles, TextSelect } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function AIDemo() {
  const editor = useArkpadEditor({
    extensions: [
      Engine,
      Heading,
      AI.configure({
        onAIRequest: async ({ command, text }) => {
          await new Promise((r) => setTimeout(r, 300));
          if (command === "complete") {
            return " This is AI-generated text. Configure a real AI handler to replace this mock.";
          }
          if (command === "summarize") {
            return "Summary: This is a mock AI summary response.";
          }
          return "Mock AI response.";
        },
      }),
    ],
    content:
      "<h1>AI Assistant</h1><p>This extension provides AI-powered autocomplete and summarization. Select text and click Summarize, or place your cursor and click Complete to see a mock response.</p>",
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="AI Extension"
      title="AI Assistant"
      description="AI-powered content generation with autocomplete and summarization. Configure with your own AI provider for real responses."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center gap-1">
            <EditorButton command="aiComplete" className="toolbar-btn" title="AI Complete">
              <Sparkles className="w-4 h-4" />
            </EditorButton>
            <EditorButton command="aiSummarize" className="toolbar-btn" title="AI Summarize">
              <TextSelect className="w-4 h-4" />
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

# `@arkpad/extension-ai`

An AI assistance and autocomplete extension for the Arkpad editor. It provides native commands for context-aware autocompletion and text summarization using custom AI request handlers.

## Installation

```bash
npm install @arkpad/extension-ai
```

## Features

- **Autocomplete (`aiComplete`)**: Automatically generates and inserts completions based on the preceding 500 characters of text.
- **Summarize (`aiSummarize`)**: Summarizes the currently selected text and replaces or appends the summary in the document.
- **Agentic Interceptor**: A hooks layer allowing validation or real-time assistance (e.g., smart correction, tone checking) on document updates.
- **Reactive Storage**: Tracks AI operation states such as `isGenerating` and `lastError`.

## Usage

```typescript
import { ArkpadEditor } from "@arkpad/core";
import { AI } from "@arkpad/extension-ai";

const editor = new ArkpadEditor({
  extensions: [
    AI.configure({
      enableInterceptor: true,
      onAIRequest: async ({ command, text, context }) => {
        if (command === "complete") {
          // Call your LLM provider (e.g., OpenAI, Anthropic, Gemini)
          const response = await fetch("/api/ai/complete", {
            method: "POST",
            body: JSON.stringify({ prompt: text }),
          });
          const data = await response.json();
          return data.completion;
        }
        
        if (command === "summarize") {
          const response = await fetch("/api/ai/summarize", {
            method: "POST",
            body: JSON.stringify({ text }),
          });
          const data = await response.json();
          return data.summary;
        }

        return "";
      },
    }),
  ],
});

// Run commands
editor.runCommand("aiComplete");
editor.runCommand("aiSummarize");
```

## Storage API

You can subscribe to or query the extension's reactive state:

```typescript
const isGenerating = editor.storage.ai.isGenerating; // boolean
const error = editor.storage.ai.lastError; // string | null
```

## API Exports

The main entry point (`src/index.ts`) exports the following:

* **`AI`** (Default & Named export): The Arkpad extension initializer.
* **`AIOptions`**: Configuration options interface:
  * `onAIRequest`: Callback function invoked for `aiComplete` and `aiSummarize` commands.
  * `enableInterceptor`: Boolean flag to enable or disable real-time document-change interception.


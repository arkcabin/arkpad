import { CodeBlock as CodeBlockExtension } from "@arkpad/extension-code-block";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Code2 } from "lucide-react";
import { ShowcaseLayout } from "../layouts/ShowcaseLayout";

export function CodeBlockDemo() {
  const editor = useArkpadEditor({
    extensions: [Engine, Heading, CodeBlockExtension],
    content: `
      <h1>Code Blocks</h1>
      <p>The code block extension allows you to embed source code with preserved whitespace and mono-spacing.</p>
      <pre><code class="language-javascript">function helloWorld() {
  console.log("Hello from Arkpad!");
}

helloWorld();</code></pre>
      <p>Try selecting text and clicking the code icon or pressing Mod+Alt+C.</p>
    `,
  });

  if (!editor) return null;

  return (
    <ShowcaseLayout
      category="Node Extension"
      title="CodeBlock"
      description="Renders a block of plain text in a pre-formatted box."
    >
      <ArkpadProvider editor={editor}>
        <div className="flex flex-col">
          <div className="h-10 px-2 border-b border-[var(--border)] flex items-center">
            <EditorButton
              command="toggleCodeBlock"
              name="codeBlock"
              className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
              activeClassName="active"
              title="Toggle Code Block"
            >
              <Code2 className="w-4 h-4" />
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

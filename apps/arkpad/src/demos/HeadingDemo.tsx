import React from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { Heading } from "@arkpad/extension-heading";
import { Heading1, Heading2, Heading3 } from "lucide-react";

// Custom SVG Icons for H4, H5, H6 to match Lucide style
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
    extensions: [Heading],
    content: `
      <h1>Heading 1: Maximum Impact</h1>
      <p>This is the primary heading for major sections.</p>
      <h2>Heading 2: Section Overview</h2>
      <p>Use this for main topics within a document.</p>
      <h3>Heading 3: Sub-section Detail</h3>
      <p>Perfect for nested information and categories.</p>
      <h4>Heading 4: Small Detail</h4>
      <p>A smaller heading for micro-sections.</p>
      <h5>Heading 5: Accent Heading</h5>
      <p>Detailed labels or metadata headers.</p>
      <h6>Heading 6: Technical Label</h6>
      <p>The smallest heading level, often used for captions or fine print headers.</p>
    `,
    autofocus: true,
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)]">
        <div className="p-6 border-b border-[var(--border)] space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-main)]">
              Heading Levels
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Support for standard HTML headings from H1 to H6.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-[var(--border)] w-fit shadow-sm">
            {[1, 2, 3, 4, 5, 6].map((level) => {
              const Icon = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6][level - 1]!;
              const name = `h${level}`;
              return (
                <EditorButton
                  key={level}
                  command="toggleHeading"
                  args={[{ level }]}
                  name={name}
                  attrs={{ level }}
                  className="p-2 rounded hover:bg-slate-100 text-slate-600 transition-colors [&.active]:bg-blue-50 [&.active]:text-blue-600"
                  activeClassName="active"
                  title={`Heading ${level}`}
                >
                  <Icon className="w-4 h-4" />
                </EditorButton>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 flex justify-center">
          <div className="max-w-2xl w-full bg-white border border-[var(--border)] shadow-sm p-12 min-h-[600px]">
            <ArkpadEditorContent
              editor={editor}
              className="prose dark:prose-invert max-w-none focus:outline-none"
            />
          </div>
        </div>
      </div>
    </ArkpadProvider>
  );
}

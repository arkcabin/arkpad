"use client";

import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { Heading } from "@arkpad/extension-heading";
import { Engine } from "@arkpad/core";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

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
      <h1>H1: Main Document Title</h1>
      <p>The primary heading that introduces the document.</p>
      <h2>H2: Section Header</h2>
      <p>Major sections of content are marked with H2 headings.</p>
      <h3>H3: Sub-section Title</h3>
      <p>Detailed sub-topics beneath a section.</p>
      <h4>H4: Minor Heading</h4>
      <p>Used for grouped details within a sub-section.</p>
      <h5>H5: Detail Heading</h5>
      <p>Fine-grained categorization of information.</p>
      <h6>H6: Technical Note</h6>
      <p>The smallest heading level, for edge-case annotations or technical footnotes.</p>
    `,
    autofocus: true,
  });

  return (
    <DemoContainer editor={editor}>
      <div className="flex items-center gap-1 overflow-x-auto">
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
    </DemoContainer>
  );
}

export const headingCode = `
import React from "react";
import { useArkpadEditor, EditorButton } from "@arkpad/react";
import { Engine } from "@arkpad/core";
import { Heading } from "@arkpad/extension-heading";
import { Heading1, Heading2, Heading3 } from "lucide-react";
import { DemoContainer } from "../components/demos/DemoContainer";

const Heading4 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 10l3 5v2h-3" />
    <path d="M21 15h-4" />
  </svg>
);

const Heading5 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 13v-3h4" />
    <path d="M17 17a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-3" />
  </svg>
);

const Heading6 = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    content: \`<h1>Title</h1><p>Content</p><h2>Section</h2><p>Details</p>\`,
    autofocus: true,
  });

  return (
    <DemoContainer editor={editor}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6].map((level) => {
          const Icon = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6][level - 1];
          return (
            <EditorButton
              key={level}
              command="toggleHeading"
              args={[{ level }]}
              name={\`h\${level}\`}
              attrs={{ level }}
              title={\`H\${level}\`}
            >
              <Icon className="w-4 h-4" />
            </EditorButton>
          );
        })}
      </div>
    </DemoContainer>
  );
}`;

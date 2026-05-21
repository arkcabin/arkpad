import React, { useRef, useMemo } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, List, ListOrdered, FileText } from "lucide-react";

// Simple debounce helper
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(() => {
    return ((...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as unknown as T;
  }, [delay]);
}

export const TextBlock: React.FC<BlockComponentProps> = ({
  id,
  props,
  styles,
  interactions,
  isEditing,
  updateBlock
}) => {
  const initialContent = useRef(props.content || "<p>Start typing here...</p>");

  const debouncedUpdate = useDebouncedCallback((html: string, markdown: string) => {
    updateBlock({ props: { content: html, markdown } });
  }, 350);

  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: initialContent.current,
    editable: !!isEditing,
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor.getHTML(), editor.getMarkdown());
    }
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div className="relative group/editor">
        {/* Inline formatting tools for TextBlock */}
        {isEditing && (
          <div className="flex items-center gap-0.5 mb-2.5 p-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-none w-max shadow-md transition-all duration-150">
            <EditorButton
              command="toggleBold"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Bold className="w-3 h-3" />
            </EditorButton>
            <EditorButton
              command="toggleItalic"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Italic className="w-3 h-3" />
            </EditorButton>
            <EditorButton
              command="toggleUnderline"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Underline className="w-3 h-3" />
            </EditorButton>
            <EditorButton
              command="toggleStrike"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Strikethrough className="w-3 h-3" />
            </EditorButton>
            <div className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-800 mx-1" />
            <EditorButton
              command="toggleHeading"
              args={[{ level: 1 }]}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Heading1 className="w-3 h-3" />
            </EditorButton>
            <EditorButton
              command="toggleHeading"
              args={[{ level: 2 }]}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Heading2 className="w-3 h-3" />
            </EditorButton>
            <div className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-800 mx-1" />
            <EditorButton
              command="toggleBulletList"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <List className="w-3 h-3" />
            </EditorButton>
            <EditorButton
              command="toggleOrderedList"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-100 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <ListOrdered className="w-3 h-3" />
            </EditorButton>
          </div>
        )}

        {/* ProseMirror Editor Content wrapper */}
        <div className="prose dark:prose-invert max-w-none text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none arkpad-inline-editor">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
};

export const TextBlockConfig: BlockConfig = {
  type: "rich-text",
  name: "Rich Text Block",
  description: "Standard document writing block with headings and lists.",
  icon: FileText,
  component: TextBlock,
  defaultProps: {
    content: "<p>Enter rich text here...</p>",
    markdown: "Enter rich text here..."
  },
  editorFields: [
    {
      name: "placeholder",
      label: "Block Placeholder Text",
      type: "text",
      placeholder: "Start typing...",
      defaultValue: "Start typing..."
    }
  ]
};

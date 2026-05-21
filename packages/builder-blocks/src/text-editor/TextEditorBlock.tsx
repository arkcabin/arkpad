import React, { useRef, useMemo } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider, EditorButton } from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { Bold, Italic, Underline, Strikethrough, Heading1, Heading2, List, ListOrdered, FileText } from "lucide-react";
import clsx from "clsx";

// Debounce hook helper
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useMemo(() => {
    return ((...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as unknown as T;
  }, [delay]);
}

export const TextEditorBlock: React.FC<BlockComponentProps> = ({
  id,
  props = {},
  styles = {},
  isEditing,
  updateBlock,
}) => {
  const initialContent = useRef(props.content || "<p>Write markdown or rich text here...</p>");

  const debouncedUpdate = useDebounce((html: string, markdown: string) => {
    updateBlock({ props: { content: html, markdown } });
  }, 350);

  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: initialContent.current,
    editable: !!isEditing,
    onUpdate: ({ editor: currentEditor }) => {
      debouncedUpdate(currentEditor.getHTML(), currentEditor.getMarkdown());
    },
  });

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div
        className={clsx(
          "w-full flex flex-col bg-white dark:bg-neutral-950 border border-neutral-350 dark:border-neutral-800 rounded-none p-4 relative transition-all duration-150",
          styles.className
        )}
        style={{
          width: styles.width,
          height: styles.height,
          marginTop: styles.marginTop,
          marginRight: styles.marginRight,
          marginBottom: styles.marginBottom,
          marginLeft: styles.marginLeft,
        }}
      >
        {/* HUD corner overlay decorations */}
        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-neutral-450 dark:border-neutral-500 z-10 pointer-events-none" />

        {isEditing && (
          <div className="flex items-center gap-0.5 mb-3 p-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-none w-max shadow-sm transition-all duration-150">
            <EditorButton
              command="toggleBold"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Bold className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton
              command="toggleItalic"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Italic className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton
              command="toggleUnderline"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Underline className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton
              command="toggleStrike"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </EditorButton>
            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-800 mx-1.5" />
            <EditorButton
              command="toggleHeading"
              args={[{ level: 1 }]}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton
              command="toggleHeading"
              args={[{ level: 2 }]}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </EditorButton>
            <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-800 mx-1.5" />
            <EditorButton
              command="toggleBulletList"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <List className="w-3.5 h-3.5" />
            </EditorButton>
            <EditorButton
              command="toggleOrderedList"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors [&.active]:bg-neutral-200 dark:[&.active]:bg-neutral-800 [&.active]:text-neutral-900 dark:[&.active]:text-white"
              activeClassName="active"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </EditorButton>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none arkpad-inline-editor leading-relaxed">
          <ArkpadEditorContent editor={editor} />
        </div>
      </div>
    </ArkpadProvider>
  );
};

export const TextEditorBlockConfig: BlockConfig = {
  type: "text-editor",
  name: "WYSIWYG Text Editor",
  description: "Interactive inline prose writing editor powered by Arkpad.",
  icon: FileText,
  component: TextEditorBlock,
  defaultProps: {
    content: "<p>Write markdown or rich text here...</p>",
    markdown: "Write markdown or rich text here...",
  },
  defaultStyles: {
    width: "100%",
  },
  editorFields: [
    {
      name: "content",
      label: "Initial Editor Content",
      type: "textarea",
      defaultValue: "<p>Write markdown or rich text here...</p>",
    },
  ],
};

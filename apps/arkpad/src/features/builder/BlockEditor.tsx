import React from "react";
import {
  ArkpadProvider,
  ArkpadEditorContent,
  BubbleMenu,
  useArkpadEditor,
} from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";

const BLOCK_EXTENSIONS = [StarterKit.configure({ table: false })];

interface Props {
  html: string;
  placeholder?: string;
  singleLine?: boolean;
  onChange: (html: string) => void;
  selected: boolean;
}

export function BlockEditor({ html, onChange, selected }: Props) {
  const editor = useArkpadEditor({
    extensions: BLOCK_EXTENSIONS,
    content: html,
    editable: true,
    autofocus: false,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
  });

  React.useEffect(() => {
    if (editor) editor.setEditable(selected);
  }, [editor, selected]);

  if (!editor) return null;

  return (
    <ArkpadProvider editor={editor}>
      <div
        className={`block-editor-wrap ${selected ? "block-editor-active" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {selected && <BubbleMenu editor={editor} defaultToolbar />}
        <ArkpadEditorContent
          editor={editor}
          className="block-editor-content"
        />
      </div>
    </ArkpadProvider>
  );
}

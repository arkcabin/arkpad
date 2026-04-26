import React, { useEffect, useRef } from "react";

import {
  ArkpadEditor,
  type ArkpadEditorOptions,
  type ArkpadEditorAPI,
} from "@arkpad/core";

export interface ArkpadEditorReactProps {
  content?: string;
  className?: string;
  onChange?: (payload: { html: string; json: unknown }) => void;
  onReady?: (editor: ArkpadEditorAPI) => void;
  options?: Omit<ArkpadEditorOptions, "element" | "content" | "onUpdate">;
}

export function ArkpadEditorComponent({
  content,
  className,
  onChange,
  onReady,
  options,
}: ArkpadEditorReactProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ArkpadEditor | null>(null);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const editor = new ArkpadEditor({
      element: hostRef.current,
      content,
      ...options,
      onUpdate: ({ html }: { html: string }) => {
        onChange?.({ html, json: editor.getJSON() });
      },
    });

    editorRef.current = editor;
    onReady?.(editor);

    return () => {
      editor.destroy();
      editorRef.current = null;
    };
  }, []);

  return <div className={className} ref={hostRef} />;
}
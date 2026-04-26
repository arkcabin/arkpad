import React, { useEffect, useRef } from "react";

import {
  ArkpadEditor as CoreEditor,
  type ArkpadEditorOptions,
} from "@arkpad/core";

export interface ArkpadEditorReactProps {
  content?: string;
  className?: string;
  onChange?: (payload: { html: string; json: unknown }) => void;
  onReady?: (editor: CoreEditor) => void;
  options?: Omit<ArkpadEditorOptions, "element" | "content" | "onUpdate">;
}

export function ArkpadEditor({
  content,
  className,
  onChange,
  onReady,
  options,
}: ArkpadEditorReactProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<CoreEditor | null>(null);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const editor = new CoreEditor({
      element: hostRef.current,
      content,
      ...options,
      onUpdate: ({ html }) => {
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

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
  onUpdate?: (payload: { editor: ArkpadEditorAPI }) => void;
  onReady?: (editor: ArkpadEditorAPI) => void;
  options?: Omit<ArkpadEditorOptions, "element" | "content" | "onUpdate">;
}

export function ArkpadEditorComponent({
  content,
  className,
  onChange,
  onUpdate,
  onReady,
  options,
}: ArkpadEditorReactProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<ArkpadEditor | null>(null);
  const [, setPulse] = React.useState(0);

  useEffect(() => {
    if (!hostRef.current) {
      return;
    }

    const editor = new ArkpadEditor({
      element: hostRef.current,
      content,
      ...options,
      onUpdate: ({ html }: { html: string }) => {
        setPulse(p => p + 1);
        onUpdate?.({ editor });
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
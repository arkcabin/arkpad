import React, { useEffect, useRef } from 'react';
import { ArkpadEditorAPI } from '@arkpad/core';

export interface ArkpadEditorContentProps {
  editor: ArkpadEditorAPI | null;
  className?: string;
}

export function ArkpadEditorContent({ editor, className }: ArkpadEditorContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor || !containerRef.current) return;

    // Attach the editor's element to this container
    containerRef.current.appendChild(editor.element);

    return () => {
      // No need to destroy here as the hook handles it
    };
  }, [editor]);

  return <div ref={containerRef} className={className} />;
}

import { useState, useEffect } from 'react';
import { ArkpadEditor, ArkpadEditorOptions, ArkpadEditorAPI } from '@arkpad/core';

export interface UseArkpadEditorOptions extends Partial<ArkpadEditorOptions> {}

export function useArkpadEditor(options: UseArkpadEditorOptions = {}) {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);
  const [, setPulse] = useState(0);

  useEffect(() => {
    // Create editor instance without an element initially
    const instance = new ArkpadEditor({
      ...options,
      element: document.createElement('div'), // Placeholder until attached
      onUpdate: (payload) => {
        setPulse(p => p + 1);
        options.onUpdate?.(payload);
      },
    });

    setEditor(instance);
    options.onCreate?.(instance);

    return () => {
      instance.destroy();
    };
  }, []);

  return editor;
}

import { useState, useEffect, useRef } from "react";
import {
  ArkpadEditor,
  type ArkpadEditorOptions,
  type ArkpadEditorAPI,
  type NodeViewConstructor,
} from "@arkpad/core";
import { type Node as PMNode } from "prosemirror-model";
import { TaskView } from "./views/Task";

export type UseArkpadEditorOptions = {
  /**
   * Whether to use Shadcn-like task items. Defaults to true.
   */
  useShadcnTaskItems?: boolean;
} & Omit<ArkpadEditorOptions, "nodeViews" | "element">;

/**
 * A hook to create and manage an Arkpad editor instance in React.
 * It handles the lifecycle of the editor and provides a reactive API.
 */
export function useArkpadEditor(options: UseArkpadEditorOptions = {}) {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);
  const [, setPulse] = useState(0);

  // Use a ref to store the editor instance to avoid closure issues in callbacks
  const editorRef = useRef<ArkpadEditorAPI | null>(null);

  // Memoize options that shouldn't trigger a re-creation unless they actually change
  // Note: For now we recreate on any option change for simplicity,
  // but we could optimize this further.

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (editorRef.current) return;

    const nodeViews: Record<string, NodeViewConstructor> = {};

    if (options.useShadcnTaskItems !== false) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nodeViews.taskItem = (node: PMNode, view: any, getPos: () => number | undefined) =>
        new TaskView(node, view, getPos);
    }

    const instance = new ArkpadEditor({
      ...options,
      nodeViews,
      element: document.createElement("div"),
      onUpdate: (payload) => {
        // Force a re-render so components using the editor hook stay in sync
        setPulse((p: number) => p + 1);
        options.onUpdate?.(payload);
      },
    });

    editorRef.current = instance;
    setEditor(instance);
    options.onCreate?.(instance);

    return () => {
      instance.destroy();
      editorRef.current = null;
    };
  }, []); // Only run once on mount

  return editor;
}

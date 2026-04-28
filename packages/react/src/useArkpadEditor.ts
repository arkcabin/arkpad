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
 *
 * NOTE: This hook only triggers a re-render when the editor is created or destroyed.
 * For reactive selection/state updates, use the `useEditorState` hook inside sub-components.
 */
export function useArkpadEditor(options: UseArkpadEditorOptions = {}) {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);

  // Use a ref to store the editor instance to avoid closure issues in callbacks
  const editorRef = useRef<ArkpadEditorAPI | null>(null);

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
        // We no longer pulse the state here!
        // This makes the editor "Super Light" and avoids parent re-renders.
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

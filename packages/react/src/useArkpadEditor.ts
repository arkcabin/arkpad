import { useState, useEffect, useRef } from "react";
import {
  ArkpadEditor,
  type ArkpadEditorOptions,
  type ArkpadEditorAPI,
  type NodeViewConstructor,
} from "@arkpad/core";
import { TaskView } from "./views/Task";

export type UseArkpadEditorOptions = {
  /**
   * Whether to use Shadcn-like task items. Defaults to true.
   */
  useShadcnTaskItems?: boolean;
} & Omit<
  ArkpadEditorOptions,
  "element" | "onUpdate" | "onTransaction" | "onSelectionUpdate" | "onPaste" | "onInterceptor"
> & {
    nodeViews?: ArkpadEditorOptions["nodeViews"];
    onUpdate?: ArkpadEditorOptions["onUpdate"];
    onTransaction?: ArkpadEditorOptions["onTransaction"];
    onSelectionUpdate?: ArkpadEditorOptions["onSelectionUpdate"];
    onPaste?: ArkpadEditorOptions["onPaste"];
    onInterceptor?: ArkpadEditorOptions["onInterceptor"];
  };

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

    const nodeViews: Record<string, NodeViewConstructor> = {
      ...(options.nodeViews || {}),
    };

    if (options.useShadcnTaskItems !== false) {
      nodeViews.taskItem = TaskView;
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

  // Sync content when it changes from outside
  useEffect(() => {
    if (!editor || options.content === undefined) return;

    const currentContent = editor.getHTML();
    // Only update if the content is actually different to avoid cursor jumps
    if (options.content !== currentContent && options.content !== editor.getJSON()) {
      editor.setContent(options.content, undefined, false);
    }
  }, [editor, options.content]);

  // Sync editable state
  useEffect(() => {
    if (!editor || options.editable === undefined) return;
    editor.setEditable(options.editable);
  }, [editor, options.editable]);

  return editor;
}

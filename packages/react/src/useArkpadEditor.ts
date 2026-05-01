import { useState, useEffect, useRef } from "react";
import {
  ArkpadEditor,
  type ArkpadEditorOptions,
  type ArkpadEditorAPI,
  type NodeViewConstructor,
  type ArkpadDocJSON,
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
 */
export function useArkpadEditor(options: UseArkpadEditorOptions = {}) {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);

  // Use refs to avoid closure issues and infinite loops
  const editorRef = useRef<ArkpadEditorAPI | null>(null);
  const isMounted = useRef(true);
  const initialContentApplied = useRef(false);

  useEffect(() => {
    isMounted.current = true;

    // Prevent double initialization in React Strict Mode
    if (editorRef.current) return;

    const nodeViews: Record<string, NodeViewConstructor> = {
      ...(options.nodeViews || {}),
    };

    if (options.useShadcnTaskItems !== false) {
      nodeViews.taskItem = TaskView;
    }

    // Initialize editor asynchronously to avoid blocking the initial paint
    const timeout = setTimeout(() => {
      if (!isMounted.current) return;

      const container = document.createElement("div");
      container.className = "arkpad-editor-wrapper";

      const instance = new ArkpadEditor({
        ...options,
        nodeViews,
        element: container,
        onUpdate: (payload) => {
          options.onUpdate?.(payload);
        },
      });

      editorRef.current = instance;
      setEditor(instance);
      options.onCreate?.(instance);

      // We mark initial content as applied immediately on boot
      initialContentApplied.current = true;
    }, 0);

    return () => {
      isMounted.current = false;
      clearTimeout(timeout);
      if (editorRef.current) {
        editorRef.current.destroy();

        // Clean up DOM element
        if (editorRef.current.element) {
          editorRef.current.element.remove();
        }

        editorRef.current = null;
        setEditor(null);
      }
    };
  }, []);

  // Sync content only if it changes from OUTSIDE and after initial boot
  useEffect(() => {
    if (!editor || !initialContentApplied.current || options.content === undefined) return;

    // We only sync if the content is truly different.
    // This prevents the "Infinite Loop" caused by lazy update payloads.
    const isHtmlContent = typeof options.content === "string";

    if (isHtmlContent) {
      const currentHtml = editor.getHTML();
      if (options.content !== currentHtml) {
        editor.setContent(options.content, false);
      }
    } else {
      const currentJson = editor.getJSON();
      const newJson = options.content as ArkpadDocJSON;
      if (JSON.stringify(newJson) !== JSON.stringify(currentJson)) {
        editor.setContent(options.content, false);
      }
    }
  }, [editor, options.content]);

  // Sync editable state
  useEffect(() => {
    if (!editor || options.editable === undefined) return;
    editor.setEditable(options.editable);
  }, [editor, options.editable]);

  return editor;
}

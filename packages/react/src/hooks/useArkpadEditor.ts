import { useState, useEffect, useRef } from "react";
import {
  ArkpadEditor,
  type ArkpadEditorOptions,
  type ArkpadEditorAPI,
  type NodeViewConstructor,
  type ArkpadDocJSON,
} from "@arkpad/core";
import { TaskView } from "../components/editor/views/Task";

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

      try {
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
      } catch (error: any) {
        console.error("❌ CRITICAL: Arkpad Editor Failed to Initialize", error);
        if (typeof window !== "undefined") {
          (window as any).ARKPAD_INIT_ERROR = error.message;
          (window as any).ARKPAD_INIT_STACK = error.stack;

          // Only append if it's not already there
          if (!document.getElementById("arkpad-init-error")) {
            const errorDiv = document.createElement("div");
            errorDiv.id = "arkpad-init-error";
            errorDiv.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);color:#ff4d4d;padding:40px;z-index:10000;overflow:auto;font-family:monospace;line-height:1.5;";
            errorDiv.innerHTML = `
              <h1 style="color:#ff4d4d;margin-top:0">🚨 Arkpad Editor Initialization Crash</h1>
              <p><strong>Error:</strong> ${error.message}</p>
              <pre style="background:#111;padding:20px;border-radius:4px;color:#888;font-size:12px;">${error.stack}</pre>
              <p style="color:#aaa;font-size:12px;margin-top:20px;">Check the console for a full schema dump if this was a SyntaxError.</p>
            `;
            document.body.appendChild(errorDiv);
          }
        }
      }
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

    const isHtmlContent = typeof options.content === "string";

    if (isHtmlContent) {
      // PRO-TIP: We compare rendered results to avoid loops caused by default attributes (like data-align)
      // If the editor already "represents" the incoming HTML, we skip the expensive setContent call.
      const currentHtml = editor.getHTML();
      if (options.content === currentHtml) return;
      
      // Secondary check: Parse incoming HTML and compare JSON structures for semantic equality
      // This is more expensive but prevents "The Infinite Alignment Loop"
      editor.setContent(options.content, false);
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

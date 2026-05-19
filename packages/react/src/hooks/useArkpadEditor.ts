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

    // Use a unique ID for this instance to help with cleanup detection
    const instanceId = Math.random().toString(36).substring(7);

    // Initialize editor asynchronously to avoid blocking the initial paint
    const timeout = setTimeout(() => {
      if (!isMounted.current) {
        console.log(`[Arkpad] Aborting init for ${instanceId} (already unmounted)`);
        return;
      }

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

        // Final check before committing the reference
        if (!isMounted.current) {
          instance.destroy();
          return;
        }

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
            errorDiv.style.cssText =
              "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);color:#ff4d4d;padding:40px;z-index:10000;overflow:auto;font-family:monospace;line-height:1.5;";
            errorDiv.innerHTML = `
              <h1 style="color:#ff4d4d;margin-top:0">🚨 Arkpad Editor Initialization Crash</h1>
              <p><strong>Error:</strong> ${error.message}</p>
              <p><strong>Instance ID:</strong> ${instanceId}</p>
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

      // Remove any existing crash screen if we are cleaning up
      const crashDiv = document.getElementById("arkpad-init-error");
      if (crashDiv) crashDiv.remove();

      if (editorRef.current) {
        const instance = editorRef.current;
        editorRef.current = null;
        setEditor(null);

        instance.destroy();
        if (instance.element) {
          instance.element.remove();
        }
      }
    };
  }, []);

  const lastSentContent = useRef<string | ArkpadDocJSON | undefined>(undefined);

  // Sync content only if it changes from OUTSIDE and after initial boot
  useEffect(() => {
    if (!editor || !initialContentApplied.current || options.content === undefined) return;

    // PERFORMANCE FIX: Only sync if the content prop itself has changed compared to what we last pushed.
    // This prevents resets during typing when the editor content is transformed (e.g. by UniqueId)
    // but the input prop remains the same literal string.
    const contentString =
      typeof options.content === "string" ? options.content : JSON.stringify(options.content);
    const lastContentString =
      typeof lastSentContent.current === "string"
        ? lastSentContent.current
        : JSON.stringify(lastSentContent.current);

    if (contentString === lastContentString) return;

    const isHtmlContent = typeof options.content === "string";

    if (isHtmlContent) {
      const currentHtml = editor.getHTML();
      if (options.content === currentHtml) {
        lastSentContent.current = options.content;
        return;
      }
      editor.setContent(options.content, false);
    } else {
      const currentJson = editor.getJSON();
      const newJson = options.content as ArkpadDocJSON;
      if (JSON.stringify(newJson) === JSON.stringify(currentJson)) {
        lastSentContent.current = options.content;
        return;
      }
      editor.setContent(options.content, false);
    }

    lastSentContent.current = options.content;
  }, [editor, options.content]);

  // Sync editable state
  useEffect(() => {
    if (!editor || options.editable === undefined) return;
    editor.setEditable(options.editable);
  }, [editor, options.editable]);

  return editor;
}

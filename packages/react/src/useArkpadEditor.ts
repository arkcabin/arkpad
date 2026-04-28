import { useState, useEffect } from "react";
import { ArkpadEditor, type ArkpadEditorOptions, type ArkpadEditorAPI, type NodeViewConstructor } from "@arkpad/core";
import { type Node as PMNode } from "prosemirror-model";
import { TaskView } from "./views/Task";

export type UseArkpadEditorOptions = {
  useShadcnTaskItems?: boolean;
} & Omit<ArkpadEditorOptions, "nodeViews" | "element">;

export function useArkpadEditor(options: UseArkpadEditorOptions = {}) {
  const [editor, setEditor] = useState<ArkpadEditorAPI | null>(null);
  const [, setPulse] = useState(0);

  useEffect(() => {
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
        setPulse((p) => p + 1);
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

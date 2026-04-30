import { useSyncExternalStore, useCallback, useRef } from "react";
import { type ArkpadEditorAPI } from "@arkpad/core";

/**
 * A hook to subscribe to specific editor state changes.
 * This is highly optimized and only triggers a re-render if the selected state changes.
 */
export function useEditorState<T>(
  editor: ArkpadEditorAPI | null,
  selector: (editor: ArkpadEditorAPI) => T,
  equalityFn: (a: T, b: T) => boolean = (a, b) => a === b
): T | null {
  const lastSelector = useRef(selector);
  const lastEquality = useRef(equalityFn);
  const lastResult = useRef<T | null>(null);

  lastSelector.current = selector;
  lastEquality.current = equalityFn;

  const getSnapshot = useCallback(() => {
    if (!editor) return null;
    const next = lastSelector.current(editor);
    
    // If the value is the same based on equalityFn, return the cached result
    // to prevent unnecessary re-renders from useSyncExternalStore
    if (lastResult.current !== null && lastEquality.current(lastResult.current, next)) {
      return lastResult.current;
    }

    lastResult.current = next;
    return next;
  }, [editor]);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!editor) return () => {};
      return editor.subscribe(onStoreChange);
    },
    [editor]
  );

  const getServerSnapshot = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

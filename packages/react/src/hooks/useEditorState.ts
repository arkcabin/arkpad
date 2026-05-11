import { useState, useEffect, useCallback, useRef } from "react";
import { type ArkpadEditorAPI } from "@arkpad/core";

/**
 * A hook to subscribe to specific editor state changes.
 * This is highly optimized and only triggers a re-render if the selected state changes.
 *
 * Re-implemented using useState + useEffect to avoid the strict "Maximum update depth"
 * issues common with useSyncExternalStore in high-frequency update environments.
 */
export function useEditorState<T>(
  editor: ArkpadEditorAPI | null,
  selector: (editor: ArkpadEditorAPI) => T,
  equalityFn: (a: T, b: T) => boolean = (a, b) => a === b
): T | null {
  // Store refs to the selector and equalityFn to avoid stale closures in subscribe
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);

  // Calculate initial state
  const [state, setState] = useState<T | null>(() => {
    if (!editor) return null;
    return selector(editor);
  });

  // Track the current value in a ref to check for changes without re-renders
  const stateRef = useRef<T | null>(state);

  // Update refs when they change
  useEffect(() => {
    selectorRef.current = selector;
    equalityFnRef.current = equalityFn;
  }, [selector, equalityFn]);

  // Handle updates from the editor
  const updateState = useCallback(() => {
    if (!editor) {
      if (stateRef.current !== null) {
        stateRef.current = null;
        setState(null);
      }
      return;
    }

    const nextState = selectorRef.current(editor);
    const hasChanged =
      stateRef.current === null || !equalityFnRef.current(stateRef.current, nextState);

    if (hasChanged) {
      stateRef.current = nextState;
      setState(nextState);
    }
  }, [editor]);

  // Subscribe to editor changes
  useEffect(() => {
    if (!editor) return;

    // Run an initial sync in case editor/selector changed
    updateState();

    return editor.subscribe(updateState);
  }, [editor, updateState]);

  return state;
}

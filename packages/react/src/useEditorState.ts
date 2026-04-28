import { useSyncExternalStore, useCallback, useRef } from "react";
import { type ArkpadEditorAPI } from "@arkpad/core";

/**
 * A hook to subscribe to specific editor state changes.
 * This is highly optimized and only triggers a re-render if the selected state changes.
 *
 * @param editor The editor instance to subscribe to.
 * @param selector A function that selects the state you want to track.
 * @param equalityFn Optional function to determine if the state has changed. Defaults to strict equality (===).
 * @returns The selected state.
 */
export function useEditorState<T>(
  editor: ArkpadEditorAPI | null,
  selector: (editor: ArkpadEditorAPI) => T,
  equalityFn: (a: T, b: T) => boolean = (a, b) => a === b
): T | null {
  // We use a ref to store the latest selector and equalityFn to avoid unnecessary re-subscriptions
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);
  const lastStateRef = useRef<T | null>(null);

  selectorRef.current = selector;
  equalityFnRef.current = equalityFn;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!editor) return () => {};

      return editor.subscribe((latestEditor) => {
        const nextState = selectorRef.current(latestEditor);
        if (!equalityFnRef.current(lastStateRef.current as T, nextState)) {
          lastStateRef.current = nextState;
          onStoreChange();
        }
      });
    },
    [editor]
  );

  const getSnapshot = useCallback(() => {
    if (!editor) return null;
    const nextState = selectorRef.current(editor);

    // Update lastStateRef if it's the first time or if it changed
    if (lastStateRef.current === null || !equalityFnRef.current(lastStateRef.current as T, nextState)) {
      lastStateRef.current = nextState;
    }

    return lastStateRef.current;
  }, [editor]);

  const getServerSnapshot = useCallback(() => {
    return null;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) as T | null;
}

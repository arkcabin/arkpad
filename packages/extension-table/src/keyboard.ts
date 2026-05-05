import type { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { goToNextCell, isInTable } from "prosemirror-tables";
import type { ArkpadEditorAPI } from "@arkpad/core";

export const keyboardShortcuts = {
  Tab: (state: EditorState, dispatch?: (tr: any) => void, view?: EditorView) => {
    if (!isInTable(state)) return false;
    const editor = (view as any)?.editor as ArkpadEditorAPI;
    if (!editor) return false;

    if (goToNextCell(1)(state, dispatch)) return true;
    if (!editor.canRunCommand("addRowAfter")) return false;
    editor.chain().addRowAfter().run();
    return goToNextCell(1)(state, dispatch);
  },
  "Shift-Tab": (state: EditorState, dispatch?: (tr: any) => void) => {
    if (!isInTable(state)) return false;
    return goToNextCell(-1)(state, dispatch);
  },
  "Shift-Enter": (_state: EditorState, _dispatch: any, view?: EditorView) => {
    const editor = (view as any)?.editor as ArkpadEditorAPI;
    if (!editor) return false;
    return editor.runCommand("exitTable");
  },
};

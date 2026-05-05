import type { EditorState } from "prosemirror-state";
import { TextSelection } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { goToNextCell, isInTable } from "prosemirror-tables";
import type { ArkpadEditor } from "@arkpad/core";
import { findParentNode } from "@arkpad/core";

export const keyboardShortcuts = {
  "Mod-a": (state: EditorState, dispatch?: (tr: any) => void) => {
    if (!isInTable(state)) return false;

    // Dynamically find the nearest cell ancestor (handles any nesting depth)
    const cellResult = findParentNode(
      (node) => node.type.spec.tableRole === "cell" || node.type.spec.tableRole === "header_cell"
    )(state.selection);

    if (!cellResult) return false;

    const { node, start } = cellResult;
    const { from, to } = state.selection;

    // Check if the entire cell content is already selected
    // Note: node.content.size represents the full inner length of the cell
    const isFullCellSelected = from === start && to === start + node.content.size;

    if (isFullCellSelected) {
      return false; // Bubble to global document selectAll
    }

    if (dispatch) {
      dispatch(
        state.tr.setSelection(TextSelection.create(state.doc, start, start + node.content.size))
      );
    }

    return true;
  },
  Tab: (state: EditorState, dispatch?: (tr: any) => void, view?: EditorView) => {
    if (!isInTable(state)) return false;
    const editor = (view as any)?.editor as ArkpadEditor;
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
    const editor = (view as any)?.editor as ArkpadEditor;
    if (!editor) return false;
    return editor.runCommand("exitTable");
  },
};

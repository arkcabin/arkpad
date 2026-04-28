import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";
import { setBlockType } from "prosemirror-commands";
import { TextSelection } from "prosemirror-state";
import { arkpadSchema } from "../schema";
import { ArkpadExtension as Extension } from "../types";

export function createDocument(): Extension {
  return {
    name: "doc",
    addCommands: () => ({
      /**
       * Focuses the editor.
       */
      focus: (position?: "start" | "end" | number | boolean | null) => (state: any, dispatch: any, view: any) => {
        if (view) {
          view.focus();

          if (position === false || position === null) {
            return true;
          }

          const { tr } = state;
          const { doc } = tr;
          let selection = state.selection;

          if (position === "start") {
            selection = TextSelection.create(doc, 0);
          } else if (position === "end") {
            selection = TextSelection.create(doc, doc.content.size);
          } else if (typeof position === "number") {
            selection = TextSelection.create(doc, position);
          }

          if (!selection.eq(state.selection)) {
            if (dispatch) dispatch(tr.setSelection(selection));
          }
        }
        return true;
      },
    }),
  };
}

export function createParagraph(): Extension {
  return {
    name: "paragraph",
    addCommands: () => ({
      setParagraph: () => setBlockType(arkpadSchema.nodes.paragraph!),
    }),
  };
}

export function createText(): Extension {
  return { name: "text", addCommands: () => ({}) };
}

export function createHardBreak(): Extension {
  return {
    name: "hardBreak",
    addCommands: () => ({
      setHardBreak: () => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.hardBreak!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Enter": (state, dispatch) => {
        const node = arkpadSchema.nodes.hardBreak!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
      "Shift-Enter": (state, dispatch) => {
        const node = arkpadSchema.nodes.hardBreak!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
  };
}

export function createHistory(): Extension {
  return {
    name: "history",
    addCommands: () => ({
      undo: () => undo,
      redo: () => redo,
    }),
    addKeyboardShortcuts: () => ({
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
    }),
    addProseMirrorPlugins: () => [history()],
  };
}

export function createPlaceholder(options: { placeholder?: string } = {}): Extension {
  return {
    name: "placeholder",
    addProseMirrorPlugins: () => [
      createPlaceholderPlugin(options.placeholder || "Start writing..."),
    ],
  };
}

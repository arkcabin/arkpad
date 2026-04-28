import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";
import { setBlockType } from "prosemirror-commands";
import { arkpadSchema } from "../schema";
import { Extension } from "../extensions-types";

export function createDocument(): Extension {
  return { name: "doc", addCommands: () => ({}) };
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

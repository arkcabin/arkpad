import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";
import { setBlockType } from "prosemirror-commands";
import { TextSelection, Plugin } from "prosemirror-state";
import { arkpadSchema } from "../schema";
import { Extension } from "@arkpad/shared";

/**
 * Ensures there is always a trailing paragraph at the end of the document.
 */
function trailingNodePlugin() {
  return new Plugin({
    appendTransaction: (transactions, oldState, newState) => {
      const { doc, schema } = newState;
      const lastNode = doc.lastChild;
      const paragraph = schema.nodes.paragraph!;

      // Don't act if the last node is already a paragraph or if doc is empty
      if (!lastNode || lastNode.type === paragraph) {
        return null;
      }

      // We only want to append a paragraph if the last node is a structural block 
      // that users might get "stuck" in (like codeBlock, heading, list).
      const structuralTypes = [
        schema.nodes.codeBlock,
        schema.nodes.heading,
        schema.nodes.bulletList,
        schema.nodes.orderedList,
        schema.nodes.taskList,
        schema.nodes.blockquote,
      ].filter(Boolean);

      if (structuralTypes.includes(lastNode.type)) {
        const tr = newState.tr;
        return tr.insert(doc.content.size, paragraph.create());
      }

      return null;
    },
  });
}

export function createDocument(): Extension {
  return Extension.create({
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
    addProseMirrorPlugins: () => [trailingNodePlugin()],
  });
}

export function createParagraph(): Extension {
  return Extension.create({
    name: "paragraph",
    addCommands: () => ({
      setParagraph: () => setBlockType(arkpadSchema.nodes.paragraph!),
    }),
  });
}

export function createText(): Extension {
  return Extension.create({ name: "text", addCommands: () => ({}) });
}

export function createHardBreak(): Extension {
  return Extension.create({
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
  });
}

export function createHistory(): Extension {
  return Extension.create({
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
  });
}

export function createPlaceholder(options: { placeholder?: string } = {}): Extension {
  return Extension.create({
    name: "placeholder",
    addProseMirrorPlugins: () => [
      createPlaceholderPlugin(options.placeholder || "Start writing..."),
    ],
  });
}

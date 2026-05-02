import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";
import { setBlockType } from "prosemirror-commands";
import { Selection, TextSelection, Plugin } from "prosemirror-state";
import { Extension } from "./Extension";

/**
 * Ensures there is always a trailing paragraph at the end of the document.
 */
function trailingNodePlugin() {
  return new Plugin({
    appendTransaction: (transactions, oldState, newState) => {
      const { doc, schema } = newState;
      const lastNode = doc.lastChild;
      const paragraph = schema.nodes.paragraph;
      if (!paragraph) return null;

      // Don't act if the last node is already a paragraph or if doc is empty
      if (!lastNode || lastNode.type === paragraph) {
        return null;
      }

      // We only want to append a paragraph if the last node is a structural block
      // that users might get "stuck" in (like codeBlock, heading, list).
      // Performance: Cache structural types on schema to avoid re-filtering every transaction.
      let structuralTypes = (schema as any)._structuralTypes;
      if (!structuralTypes) {
        structuralTypes = Object.values(schema.nodes).filter(
          (nodeType) => (nodeType.spec as any).trailingNode
        );
        (schema as any)._structuralTypes = structuralTypes;
      }

      if (structuralTypes.includes(lastNode.type)) {
        const tr = newState.tr;
        return tr.insert(doc.content.size, paragraph.create()).scrollIntoView();
      }

      return null;
    },
  });
}

export function createDocument(): Extension {
  return Extension.create({
    name: "doc",
    addNodes() {
      return {
        doc: {
          content: "block+",
          marks: "_",
        },
      };
    },
    addCommands: () => ({
      /**
       * Focuses the editor.
       */
      focus: (position?: "start" | "end" | number | boolean | null) => (props: any) => {
        const { state, dispatch, view } = props;
        if (view) {
          view.focus();

          if (position === false || position === null) {
            return true;
          }

          const { tr } = state;
          const { doc } = tr;
          let selection = state.selection;

          if (position === "start" || position === true || position === undefined) {
            selection = Selection.atStart(doc);
          } else if (position === "end") {
            selection = Selection.atEnd(doc);
          } else if (typeof position === "number") {
            selection = TextSelection.create(doc, Math.min(position, doc.content.size));
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
    addNodes() {
      return {
        paragraph: {
          content: "inline*",
          marks: "_",
          group: "block",
          attrs: { align: { default: "left" } },
          parseDOM: [
            {
              tag: "p",
              getAttrs: (dom: HTMLElement) => ({
                align: dom.style.textAlign || dom.getAttribute("data-align") || "left",
              }),
            },
          ],
          toDOM(node) {
            const { align } = node.attrs;
            return [
              "p",
              { "data-align": align, style: align !== "left" ? `text-align: ${align}` : null },
              0,
            ];
          },
        },
      };
    },
    addCommands: () => ({
      setParagraph: () => (props: any) => {
        return setBlockType(props.state.schema.nodes.paragraph!, {
          align: "left",
        })(props.state, props.dispatch);
      },
    }),
  });
}

export function createText(): Extension {
  return Extension.create({
    name: "text",
    addNodes() {
      return {
        text: {
          group: "inline",
        },
      };
    },
  });
}

export function createHardBreak(): Extension {
  return Extension.create({
    name: "hardBreak",
    addNodes() {
      return {
        hard_break: {
          inline: true,
          group: "inline",
          selectable: false,
          parseDOM: [{ tag: "br" }],
          toDOM() {
            return ["br"];
          },
        },
      };
    },
    addCommands: () => ({
      setHardBreak: () => (props: any) => {
        const { state, dispatch } = props;
        const node = state.schema.nodes.hard_break!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Enter": (state: any, dispatch: any) => {
        const node = state.schema.nodes.hard_break!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
      "Shift-Enter": (state: any, dispatch: any) => {
        const node = state.schema.nodes.hard_break!.create();
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

import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";
import { setBlockType } from "prosemirror-commands";
import { Selection, TextSelection, Plugin } from "prosemirror-state";
import { Node } from "../../sdk/Node";
import { Extension } from "../../sdk/Extension";
import { Attributes } from "../../api";
import { NodeRole } from "../../core/Governance";

/**
 * Ensures there is always a trailing section with content at the end of the document.
 */
function trailingNodePlugin() {
  return new Plugin({
    appendTransaction: (transactions, oldState, newState) => {
      const { doc, schema } = newState;
      const lastNode = doc.lastChild;

      const paragraph = schema.nodes.paragraph;
      if (!paragraph) return null;

      // If document is empty, insert a paragraph
      if (doc.content.size === 0) {
        return newState.tr.insert(0, paragraph.create()).scrollIntoView();
      }

      return null;
    },
  });
}

export interface DocumentOptions {
  content: string;
  attributes: Attributes;
}

export function createDocument(): Node<DocumentOptions> {
  return Node.create<DocumentOptions>({
    name: "doc",
    role: NodeRole.ROOT,

    addOptions() {
      return {
        content: "block+",
        attributes: {},
      };
    },

    addAttributes() {
      return this.options.attributes;
    },

    renderHTML() {
      return ["main", { class: "arkpad-editor" }, 0];
    },

    // Use the native content property so SchemaBuilder picks it up correctly
    content: "block+",

    addCommands: () => ({
      /**
       * Updates attributes of the document node.
       */
      setDocAttributes:
        (attributes: Record<string, any>) =>
        ({ tr, state }: any) => {
          tr.setNodeMarkup(0, undefined, {
            ...state.doc.attrs,
            ...attributes,
          });
          return true;
        },

      /**
       * Focuses the editor.
       */
      focus: (position?: "start" | "end" | number | boolean | null) => (props: any) => {
        const { state, dispatch, view } = props;
        if (view && dispatch) {
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

export function createParagraph(): Node {
  return Node.create({
    name: "paragraph",
    group: "block",
    content: "inline*",
    marks: "_",

    addAttributes() {
      return {
        align: {
          default: "left",
          parseHTML: (element: HTMLElement) =>
            element.style.textAlign || element.getAttribute("data-align") || "left",
          renderHTML: (attributes) => {
            if (attributes.align === "left") return {};
            return {
              style: `text-align: ${attributes.align}`,
              "data-align": attributes.align,
            };
          },
        },
      };
    },

    renderHTML({ HTMLAttributes }) {
      return ["p", HTMLAttributes, 0];
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

export function createText(): Node {
  return Node.create({
    name: "text",
    group: "inline",
  });
}

export function createHardBreak(): Node {
  return Node.create({
    name: "hardBreak",
    inline: true,
    group: "inline",
    selectable: false,
    role: NodeRole.ATOM, // Explicitly set role to ATOM (1) to prevent it being a block (2)

    parseHTML() {
      return [{ tag: "br" }];
    },

    renderHTML() {
      return ["br"];
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

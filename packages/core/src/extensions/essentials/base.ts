import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";
import { setBlockType } from "prosemirror-commands";
import { Selection, TextSelection, Plugin } from "prosemirror-state";
import { Extension } from "../../sdk/Extension";

/**
 * Ensures there is always a trailing section with content at the end of the document.
 */
function trailingNodePlugin() {
  return new Plugin({
    appendTransaction: (transactions, oldState, newState) => {
      const { doc, schema } = newState;
      const lastNode = doc.lastChild;

      // Try to use section if available, otherwise fallback to paragraph
      const section = schema.nodes.section;
      const fallbackNode = section || schema.nodes.paragraph;
      if (!fallbackNode) return null;

      // Ensure there is always at least one content node at the end
      if (!lastNode || lastNode.type === schema.nodes.doc) {
        const paragraph = schema.nodes.paragraph;
        if (!paragraph) return null;

        const tr = newState.tr;
        const contentNode = section
          ? section.create(null, [paragraph.create()])
          : paragraph.create();
        return tr.insert(doc.content.size, contentNode).scrollIntoView();
      }

      // If using sections, ensure last section has content
      if (section && lastNode.type === section && lastNode.childCount === 0) {
        const paragraph = schema.nodes.paragraph;
        if (!paragraph) return null;

        const tr = newState.tr;
        const newSection = lastNode.type.create(lastNode.attrs, [paragraph.create()]);
        // Calculate position of last node: doc size minus last node size
        const start = doc.content.size - lastNode.nodeSize;
        return tr.replaceWith(start, doc.content.size, newSection).scrollIntoView();
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
          content: "section+",
          marks: "_",
          parseDOM: [
            {
              tag: "main#ark-page-root",
            },
          ],
          toDOM() {
            return ["main", { id: "ark-page-root" }, 0];
          },
        },
      };
    },
    addCommands: () => ({
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

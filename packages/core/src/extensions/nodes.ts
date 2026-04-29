import { setBlockType } from "prosemirror-commands";
import { textblockTypeInputRule, wrappingInputRule, InputRule } from "prosemirror-inputrules";
import { Schema } from "prosemirror-model";
import { Extension } from "@arkpad/shared";
import { toggleBlock } from "./utils";

function getAlignAttrs(state: any) {
  const { $from } = state.selection;
  return { align: $from.parent.attrs?.align || "left" };
}

export function createHeading(): Extension {
  return Extension.create({
    name: "heading",
    addCommands: () => ({
      toggleHeading: (attrs: { level: number }) => (state: any, dispatch: any) => {
        return toggleBlock(state.schema.nodes.heading!, attrs)(state, dispatch);
      },
      setHeading1: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 1, align: getAlignAttrs(state).align })(
          state,
          dispatch
        ),
      setHeading2: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 2, align: getAlignAttrs(state).align })(
          state,
          dispatch
        ),
      setHeading3: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 3, align: getAlignAttrs(state).align })(
          state,
          dispatch
        ),
      setHeading4: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 4, align: getAlignAttrs(state).align })(
          state,
          dispatch
        ),
      setHeading5: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 5, align: getAlignAttrs(state).align })(
          state,
          dispatch
        ),
      setHeading6: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 6, align: getAlignAttrs(state).align })(
          state,
          dispatch
        ),
    }),
    addInputRules: (schema: Schema) => [
      textblockTypeInputRule(/^(#{1,6})\s$/, schema.nodes.heading!, (match) => ({
        level: match[1]?.length || 1,
      })),
    ],
  });
}

export function createBlockquote(): Extension {
  return Extension.create({
    name: "blockquote",
    addCommands: () => ({
      toggleBlockquote: () => (state: any, dispatch: any) => {
        return toggleBlock(state.schema.nodes.blockquote!)(state, dispatch);
      },
    }),
    addInputRules: (schema: Schema) => [wrappingInputRule(/^\s*>\s$/, schema.nodes.blockquote!)],
  });
}

export function createCodeBlock(): Extension {
  return Extension.create({
    name: "codeBlock",
    addCommands: () => ({
      toggleCodeBlock: () => (state: any, dispatch: any) => {
        return toggleBlock(state.schema.nodes.codeBlock!)(state, dispatch);
      },
    }),
    addKeyboardShortcuts: (schema: Schema) => ({
      Enter: (state, dispatch) => {
        const { selection, tr } = state;
        const { $from, empty } = selection;

        if (!empty || $from.parent.type !== schema.nodes.codeBlock) {
          return false;
        }

        const isAtEnd = $from.parentOffset === $from.parent.content.size;
        const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
        
        // If the line is empty (it ends with a newline and we are at the end)
        // or if it's the second Enter on an empty line.
        if (isAtEnd && textBefore.endsWith("\n")) {
          if (dispatch) {
            // Remove the newline that triggered this breakout
            tr.delete($from.pos - 1, $from.pos);
            
            const paragraph = schema.nodes.paragraph!;
            const posAfter = $from.after();
            
            tr.insert(posAfter, paragraph.create());
            tr.setSelection(state.selection.constructor.near(tr.doc.resolve(posAfter + 1)));
            dispatch(tr.scrollIntoView());
          }
          return true;
        }

        return false;
      },
    }),

    addInputRules: (schema: Schema) => [textblockTypeInputRule(/^```$/, schema.nodes.codeBlock!)],
  });
}

export function createHorizontalRule(): Extension {
  return Extension.create({
    name: "horizontalRule",
    addCommands: () => ({
      setHorizontalRule: () => (state: any, dispatch: any) => {
        const node = state.schema.nodes.horizontalRule!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
    addInputRules: (schema: Schema) => [
      new InputRule(/^(?:---|___\s|\*\*\*\s)$/, (state, match, start, end) => {
        const { tr } = state;
        const node = schema.nodes.horizontalRule!.create();
        if (match[0]) {
          tr.replaceWith(start, end, node);
        }
        return tr;
      }),
    ],
  });
}

export function createImage(): Extension {
  return Extension.create({
    name: "image",
    addCommands: () => ({
      setImage: (options: string | { src: string; alt?: string; title?: string }) => (
        state: any,
        dispatch: any
      ) => {
        const attrs = typeof options === "string" ? { src: options } : options;
        const node = state.schema.nodes.image!.create(attrs);
        const tr = state.tr.replaceSelectionWith(node);
        if (dispatch) dispatch(tr);
        return true;
      },
    }),
  });
}

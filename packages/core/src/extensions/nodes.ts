import { setBlockType } from "prosemirror-commands";
import { textblockTypeInputRule } from "prosemirror-inputrules";
import { Schema } from "prosemirror-model";
import { Extension } from "../extensions-types";
import { toggleBlock } from "./utils";

export function createHeading(): Extension {
  return {
    name: "heading",
    addCommands: () => ({
      toggleHeading: (attrs: { level: number }) => (state: any, dispatch: any) => {
        return toggleBlock(state.schema.nodes.heading!, attrs)(state, dispatch);
      },
      setHeading1: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 1 })(state, dispatch),
      setHeading2: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 2 })(state, dispatch),
      setHeading3: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 3 })(state, dispatch),
      setHeading4: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 4 })(state, dispatch),
      setHeading5: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 5 })(state, dispatch),
      setHeading6: () => (state: any, dispatch: any) =>
        setBlockType(state.schema.nodes.heading!, { level: 6 })(state, dispatch),
    }),
    addInputRules: (schema: Schema) => [
      textblockTypeInputRule(/^(#{1,6})\s$/, schema.nodes.heading!, (match) => ({
        level: match[1]?.length || 1,
      })),
    ],
  };
}

export function createBlockquote(): Extension {
  return {
    name: "blockquote",
    addCommands: () => ({
      toggleBlockquote: () => (state: any, dispatch: any) => {
        return toggleBlock(state.schema.nodes.blockquote!)(state, dispatch);
      },
    }),
  };
}

export function createCodeBlock(): Extension {
  return {
    name: "codeBlock",
    addCommands: () => ({
      toggleCodeBlock: () => (state: any, dispatch: any) => {
        return toggleBlock(state.schema.nodes.codeBlock!)(state, dispatch);
      },
    }),
    addInputRules: (schema: Schema) => [textblockTypeInputRule(/^```$/, schema.nodes.codeBlock!)],
  };
}

export function createHorizontalRule(): Extension {
  return {
    name: "horizontalRule",
    addCommands: () => ({
      setHorizontalRule: () => (state: any, dispatch: any) => {
        const node = state.schema.nodes.horizontalRule!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
  };
}

export function createImage(): Extension {
  return {
    name: "image",
    addCommands: () => ({
      setImage: (src: string, alt?: string, title?: string) => (state: any, dispatch: any) => {
        const node = state.schema.nodes.image!.create({ src, alt, title });
        const tr = state.tr.replaceSelectionWith(node);
        if (dispatch) dispatch(tr);
        return true;
      },
    }),
  };
}

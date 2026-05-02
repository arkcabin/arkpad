import { Mark, ArkpadCommandProps, PMNode, type Schema } from "@arkpad/core";
import { toggleMark, markInputRule } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setCode: () => void;
    toggleCode: () => void;
    unsetCode: () => void;
  }
}

/**
 * Code extension.
 */
export const Code = Mark.create({
  name: "code",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: "code" },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["code", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setCode: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.code;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.addMark(state.selection.from, state.selection.to, markType.create()));
        }
        return true;
      },
      toggleCode: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.code;
        if (!markType) return false;
        return toggleMark(markType)(state, dispatch);
      },
      unsetCode: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.code;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.removeMark(state.selection.from, state.selection.to, markType));
        }
        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-e": () => this.editor?.runCommand("toggleCode"),
    };
  },

  addInputRules(schema: Schema) {
    const markType = schema.marks.code;
    if (!markType) return [];
    return [
      markInputRule(/(?:^|[^`])(?:`)([^`]+)(?:`)$/, markType),
    ];
  },
});

export default Code;

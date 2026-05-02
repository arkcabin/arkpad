import { Mark, ArkpadCommandProps, PMNode, type Schema } from "@arkpad/core";
import { toggleMark, markInputRule } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setStrike: () => void;
    toggleStrike: () => void;
    unsetStrike: () => void;
  }
}

/**
 * Strike extension.
 */
export const Strike = Mark.create({
  name: "strike",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: "s" },
      { tag: "del" },
      { tag: "strike" },
      { style: "text-decoration", getAttrs: (value: string) => value === "line-through" && null },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["s", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setStrike: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.strike;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.addMark(state.selection.from, state.selection.to, markType.create()));
        }
        return true;
      },
      toggleStrike: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.strike;
        if (!markType) return false;
        return toggleMark(markType)(state, dispatch);
      },
      unsetStrike: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.strike;
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
      "Mod-Shift-s": () => this.editor?.runCommand("toggleStrike"),
      "Mod-Shift-S": () => this.editor?.runCommand("toggleStrike"),
    };
  },

  addInputRules(schema: Schema) {
    const markType = schema.marks.strike;
    if (!markType) return [];
    return [
      markInputRule(/(?:^|[^*_])(?:~~)([^*_]+)(?:~~)$/, markType),
    ];
  },
});

export default Strike;

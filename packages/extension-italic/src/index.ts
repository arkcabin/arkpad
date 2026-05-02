import { Mark, ArkpadCommandProps, PMNode, type Schema } from "@arkpad/core";
import { toggleMark, markInputRule } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setItalic: () => void;
    toggleItalic: () => void;
    unsetItalic: () => void;
  }
}

/**
 * Italic extension.
 */
export const Italic = Mark.create({
  name: "italic",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: "em" },
      { tag: "i" },
      { style: "font-style=italic" },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["em", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setItalic: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.italic;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.addMark(state.selection.from, state.selection.to, markType.create()));
        }
        return true;
      },
      toggleItalic: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.italic;
        if (!markType) return false;
        return toggleMark(markType)(state, dispatch);
      },
      unsetItalic: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.italic;
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
      "Mod-i": () => this.editor?.runCommand("toggleItalic"),
      "Mod-I": () => this.editor?.runCommand("toggleItalic"),
    };
  },

  addInputRules(schema: Schema) {
    const markType = schema.marks.italic;
    if (!markType) return [];
    return [
      markInputRule(/(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)$/, markType),
    ];
  },
});

export default Italic;

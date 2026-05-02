import { Mark, ArkpadCommandProps, PMNode } from "@arkpad/core";
import { toggleMark } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setUnderline: () => void;
    toggleUnderline: () => void;
    unsetUnderline: () => void;
  }
}

/**
 * Underline extension.
 */
export const Underline = Mark.create({
  name: "underline",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: "u" },
      { style: "text-decoration", getAttrs: (value: string) => value === "underline" && null },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["u", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setUnderline: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.underline;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.addMark(state.selection.from, state.selection.to, markType.create()));
        }
        return true;
      },
      toggleUnderline: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.underline;
        if (!markType) return false;
        return toggleMark(markType)(state, dispatch);
      },
      unsetUnderline: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.underline;
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
      "Mod-u": () => this.editor?.runCommand("toggleUnderline"),
      "Mod-U": () => this.editor?.runCommand("toggleUnderline"),
    };
  },
});

export default Underline;

import { Mark, ArkpadCommandProps, PMNode } from "@arkpad/core";
import { toggleMark } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setSubscript: () => void;
    toggleSubscript: () => void;
    unsetSubscript: () => void;
  }
}

/**
 * Subscript extension.
 */
export const Subscript = Mark.create({
  name: "subscript",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: "sub" },
      { style: "vertical-align", getAttrs: (value: string) => value === "sub" && null },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["sub", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setSubscript: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.subscript;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.addMark(state.selection.from, state.selection.to, markType.create()));
        }
        return true;
      },
      toggleSubscript: () => (props: ArkpadCommandProps) => {
        const markType = props.state.schema.marks.subscript;
        if (!markType) return false;
        return toggleMark(markType)(props);
      },
      unsetSubscript: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.subscript;
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
      "Mod-,": () => this.editor?.runCommand("toggleSubscript"),
    };
  },
});

export default Subscript;

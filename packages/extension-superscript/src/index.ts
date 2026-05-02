import { Mark, ArkpadCommandProps, PMNode } from "@arkpad/core";
import { toggleMark } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setSuperscript: () => void;
    toggleSuperscript: () => void;
    unsetSuperscript: () => void;
  }
}

/**
 * Superscript extension.
 */
export const Superscript = Mark.create({
  name: "superscript",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: "sup" },
      { style: "vertical-align", getAttrs: (value: string) => value === "super" && null },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["sup", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setSuperscript: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.superscript;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.addMark(state.selection.from, state.selection.to, markType.create()));
        }
        return true;
      },
      toggleSuperscript: () => (props: ArkpadCommandProps) => {
        const markType = props.state.schema.marks.superscript;
        if (!markType) return false;
        return toggleMark(markType)(props);
      },
      unsetSuperscript: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.superscript;
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
      "Mod-.": () => this.editor?.runCommand("toggleSuperscript"),
    };
  },
});

export default Superscript;

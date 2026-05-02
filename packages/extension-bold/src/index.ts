import { Mark, ArkpadCommandProps, PMNode, type Schema } from "@arkpad/core";
import { toggleMark, markInputRule } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setBold: () => void;
    toggleBold: () => void;
    unsetBold: () => void;
  }
}

/**
 * Bold extension.
 */
export const Bold = Mark.create({
  name: "bold",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      { tag: "strong" },
      { tag: "b", getAttrs: (node: HTMLElement) => node.style.fontWeight !== "normal" && null },
      {
        style: "font-weight",
        getAttrs: (value: string) => /^(bold(er)?|[789]00)$/.test(value) && null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["strong", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setBold: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.bold;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.addMark(state.selection.from, state.selection.to, markType.create()));
        }
        return true;
      },
      toggleBold: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.bold;
        if (!markType) return false;
        return toggleMark(markType)(state, dispatch);
      },
      unsetBold: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.bold;
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
      "Mod-b": () => this.editor?.runCommand("toggleBold"),
      "Mod-B": () => this.editor?.runCommand("toggleBold"),
    };
  },

  addInputRules(schema: Schema) {
    const markType = schema.marks.bold;
    if (!markType) return [];
    return [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, markType),
    ];
  },
});

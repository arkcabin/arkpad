import { Mark, ArkpadCommandProps, PMNode, toggleMark } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setColor: (color: string) => void;
    toggleColor: (color: string) => void;
    unsetColor: () => void;
  }
}

export interface ColorOptions {
  HTMLAttributes: Record<string, any>;
}

export const Color = Mark.create<ColorOptions>({
  name: "color",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color || null,
        renderHTML: (attributes: any) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "color",
        getAttrs: (value: string) => value && { color: value },
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["span", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setColor: (color: string) => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.color;
        if (!markType) return false;
        if (dispatch) {
          dispatch(
            state.tr.addMark(state.selection.from, state.selection.to, markType.create({ color }))
          );
        }
        return true;
      },
      toggleColor: (color: string) => (props: ArkpadCommandProps) => {
        const markType = props.state.schema.marks.color;
        if (!markType) return false;
        return toggleMark(markType, { color })(props);
      },
      unsetColor: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.color;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.removeMark(state.selection.from, state.selection.to, markType));
        }
        return true;
      },
    };
  },
});

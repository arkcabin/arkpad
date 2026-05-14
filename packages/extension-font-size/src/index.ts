import { Mark, ArkpadCommandProps, PMNode } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setFontSize: (fontSize: string) => void;
    unsetFontSize: () => void;
  }
}

export interface FontSizeOptions {
  HTMLAttributes: Record<string, any>;
}

export const FontSize = Mark.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: any) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "font-size",
        getAttrs: (value: string) => value && { fontSize: value },
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["span", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setFontSize: (fontSize: string) => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.fontSize;
        if (!markType) return false;
        if (dispatch) {
          dispatch(
            state.tr.addMark(
              state.selection.from,
              state.selection.to,
              markType.create({ fontSize })
            )
          );
        }
        return true;
      },
      unsetFontSize: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.fontSize;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.removeMark(state.selection.from, state.selection.to, markType));
        }
        return true;
      },
    };
  },
});

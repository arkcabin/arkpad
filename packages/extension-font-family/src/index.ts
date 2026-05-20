import { Mark, ArkpadCommandProps, PMNode } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setFontFamily: (fontFamily: string) => void;
    unsetFontFamily: () => void;
  }
}

export interface FontFamilyOptions {
  HTMLAttributes: Record<string, any>;
}

export const FontFamily = Mark.create<FontFamilyOptions>({
  name: "fontFamily",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontFamily || null,
        renderHTML: (attributes: any) => {
          if (!attributes.fontFamily) return {};
          return { style: `font-family: ${attributes.fontFamily}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        style: "font-family",
        getAttrs: (value: string) => value && { fontFamily: value },
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["span", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setFontFamily: (fontFamily: string) => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.fontFamily;
        if (!markType) return false;
        if (dispatch) {
          dispatch(
            state.tr.addMark(
              state.selection.from,
              state.selection.to,
              markType.create({ fontFamily })
            )
          );
        }
        return true;
      },
      unsetFontFamily: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.fontFamily;
        if (!markType) return false;
        if (dispatch) {
          dispatch(state.tr.removeMark(state.selection.from, state.selection.to, markType));
        }
        return true;
      },
    };
  },
});

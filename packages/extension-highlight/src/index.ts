import { Mark, ArkpadCommandProps, PMNode } from "@arkpad/core";
import { toggleMark } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setHighlight: (attributes?: { color?: string }) => void;
    toggleHighlight: (attributes?: { color?: string }) => void;
    unsetHighlight: () => void;
  }
}

export interface HighlightOptions {
  color: string | undefined;
  HTMLAttributes: Record<string, any>;
}

/**
 * Highlight extension.
 */
export const Highlight = Mark.create<HighlightOptions>({
  name: "highlight",

  addOptions() {
    return {
      color: "#ffff00",
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark",
        getAttrs: (node: string | HTMLElement) => {
          if (!(node instanceof HTMLElement)) return null;
          return {
            color: node.style.backgroundColor || node.getAttribute("data-color") || null,
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    const { color } = HTMLAttributes;
    const style = color ? `background-color: ${color};` : "";

    return [
      "mark",
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        style: (HTMLAttributes.style || "") + style,
        "data-color": color,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setHighlight: (attributes: { color?: string } | undefined) => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.highlight;
        if (!markType) return false;

        const color = attributes?.color || this.options.color;
        const { from, to, empty } = state.selection;

        if (empty) return false;

        if (dispatch) {
          dispatch(state.tr.addMark(from, to, markType.create({ color })));
        }
        return true;
      },
      toggleHighlight:
        (attributes: { color?: string } | undefined) => (props: ArkpadCommandProps) => {
          const markType = props.state.schema.marks.highlight;
          if (!markType) return false;

          const color = attributes?.color || this.options.color;
          return toggleMark(markType, { color })(props);
        },
      unsetHighlight: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const markType = state.schema.marks.highlight;
        if (!markType) return false;

        const { from, to, empty } = state.selection;
        if (empty) return false;

        if (dispatch) {
          dispatch(state.tr.removeMark(from, to, markType));
        }
        return true;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor?.runCommand("toggleHighlight"),
    };
  },
});

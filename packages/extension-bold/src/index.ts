import { Extension, ArkpadCommandProps } from "@arkpad/core";
import { toggleMark } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleBold: () => void;
  }
}

export const Bold = Extension.create({
  name: "bold",

  activeMapping: {
    toggleBold: "strong",
  },

  addMarks() {
    return {
      strong: {
        parseDOM: [
          { tag: "strong" },
          { tag: "b", getAttrs: (node: HTMLElement) => node.style.fontWeight !== "normal" && null },
          {
            style: "font-weight",
            getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
          },
        ],
        toDOM() {
          return ["strong", 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleBold:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const markType = state.schema.marks["strong"];
          if (!markType) return false;
          return toggleMark(markType)(state, dispatch);
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-b": () => this.editor!.runCommand("toggleBold"),
    };
  },
});

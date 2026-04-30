import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const Italic = Extension.create({
  name: "italic",

  activeMapping: {
    toggleItalic: "em",
  },

  addMarks() {
    return {
      em: {
        parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
        toDOM() {
          return ["em", 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleItalic:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleMark("em").run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-i": () => this.editor!.runCommand("toggleItalic"),
    };
  },
});

export default Italic;

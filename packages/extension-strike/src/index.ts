import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const Strike = Extension.create({
  name: "strike",

  activeMapping: {
    toggleStrike: "strike",
  },

  addMarks() {
    return {
      strike: {
        parseDOM: [
          { tag: "s" },
          { tag: "del" },
          { tag: "strike" },
          { style: "text-decoration=line-through" },
        ],
        toDOM() {
          return ["s", 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleStrike:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleMark("strike");
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-s": () => this.editor!.runCommand("toggleStrike"),
    };
  },
});

export default Strike;

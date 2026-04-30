import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const Underline = Extension.create({
  name: "underline",

  activeMapping: {
    toggleUnderline: "underline",
  },

  addMarks() {
    return {
      underline: {
        parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
        toDOM() {
          return ["u", 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleUnderline:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleMark("underline").run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-u": () => this.editor!.runCommand("toggleUnderline"),
    };
  },
});

export default Underline;

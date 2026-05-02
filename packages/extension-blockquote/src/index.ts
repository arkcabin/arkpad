import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const Blockquote = Extension.create({
  name: "blockquote",

  addNodes() {
    return {
      blockquote: {
        content: "block+",
        marks: "_",
        group: "block",
        defining: true,
        trailingNode: true,
        parseDOM: [{ tag: "blockquote" }],
        toDOM() {
          return ["blockquote", 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleBlockquote: () => ({ chain }: ArkpadCommandProps) => {
        return chain().toggleBlock("blockquote");
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-b": () => this.editor!.runCommand("toggleBlockquote"),
    };
  },
});

export default Blockquote;

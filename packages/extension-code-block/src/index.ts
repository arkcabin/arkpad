import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const CodeBlock = Extension.create({
  name: "codeBlock",

  addNodes() {
    return {
      code_block: {
        content: "text*",
        marks: "",
        group: "block",
        code: true,
        defining: true,
        parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
        toDOM() {
          return ["pre", ["code", 0]];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleCodeBlock: () => ({ chain }: ArkpadCommandProps) => {
        return chain().toggleBlock("code_block");
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor!.runCommand("toggleCodeBlock"),
    };
  },
});

export default CodeBlock;

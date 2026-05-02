import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const HorizontalRule = Extension.create({
  name: "horizontalRule",

  addNodes() {
    return {
      horizontal_rule: {
        group: "block",
        trailingNode: true,
        parseDOM: [{ tag: "hr" }],
        toDOM() {
          return ["hr"];
        },
      },
    };
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ chain, state }: ArkpadCommandProps) => {
          const type = state.schema.nodes.horizontal_rule;
          if (!type) return false;
          return chain()
            .insertNode("horizontal_rule")
            .command(({ tr }) => {
              tr.scrollIntoView();
              return true;
            });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor!.runCommand("setHorizontalRule"),
    };
  },
});

export default HorizontalRule;

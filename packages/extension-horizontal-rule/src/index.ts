import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const HorizontalRule = Extension.create({
  name: "horizontalRule",

  addNodes() {
    return {
      horizontal_rule: {
        group: "block",
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
            .command(({ tr, state: currentState }) => {
              const { $from } = currentState.selection;
              if (!$from.parent.canReplaceWith($from.index(), $from.indexAfter(), type)) {
                return false;
              }
              tr.replaceSelectionWith(type.create());
              return true;
            })
            .run();
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

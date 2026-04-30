import { Extension } from "@arkpad/core";

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
      setHorizontalRule: () => (props: any) => {
        const type = props.state.schema.nodes.horizontal_rule;
        if (!type) return false;
        return this.editor.runCommand('insertNode', type, {}, props);
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor.runCommand("setHorizontalRule"),
    };
  },
});

export default HorizontalRule;

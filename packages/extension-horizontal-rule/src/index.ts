import { Node, ArkpadCommandProps, TextSelection, PMNode } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setHorizontalRule: () => void;
  }
}

export interface HorizontalRuleOptions {
  HTMLAttributes: Record<string, any>;
}

export const HorizontalRule = Node.create<HorizontalRuleOptions>({
  name: "horizontalRule",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: "block",
  trailingNode: true,

  parseHTML() {
    return [{ tag: "hr" }];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["hr", { ...this.options.HTMLAttributes, ...HTMLAttributes }];
  },

  addCommands() {
    return {
      setHorizontalRule:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { selection, schema, tr } = state;
          const { $from } = selection;

          const hr = schema.nodes.horizontalRule;
          const p = schema.nodes.paragraph;
          if (!hr || !p) return false;

          if (dispatch) {
            const horizontalRuleNode = hr.create(this.options.HTMLAttributes);
            const currentBlock = $from.parent;
            const isEmptyParagraph =
              currentBlock.type.name === "paragraph" && currentBlock.content.size === 0;

            if (isEmptyParagraph) {
              // Replace the entire empty paragraph with HR + new Paragraph
              const paragraphNode = p.create();
              tr.replaceWith($from.before(), $from.after(), [horizontalRuleNode, paragraphNode]);
              // Move cursor to the new paragraph
              const newSelection = TextSelection.create(
                tr.doc,
                $from.before() + horizontalRuleNode.nodeSize + 1
              );
              tr.setSelection(newSelection);
            } else {
              // If we are in the middle of a paragraph, split it and put HR in between
              tr.replaceSelectionWith(horizontalRuleNode, true);
            }

            dispatch(tr.scrollIntoView());
          }

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-h": () => this.editor!.runCommand("setHorizontalRule"),
    };
  },

  addInputRules() {
    return [
      {
        find: /^(?:---|—-|___)$/,
        handler: ({ chain }: any) => {
          chain().setHorizontalRule().run();
        },
      },
    ];
  },
});

export default HorizontalRule;

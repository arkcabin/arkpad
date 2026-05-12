import { Node, ArkpadCommandProps, PMNode, NodeRole } from "@arkpad/core";
import ListItem from "@arkpad/extension-list-item";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleBulletList: () => void;
  }
}

export interface BulletListOptions {
  HTMLAttributes: Record<string, any>;
}

export const BulletList = Node.create<BulletListOptions>({
  name: "bulletList",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addExtensions() {
    return [ListItem];
  },

  group: "block",
  role: NodeRole.CONTENT,
  content: "listItem+",
  trailingNode: true,

  parseHTML() {
    return [{ tag: "ul" }];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["ul", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      toggleBulletList:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleList("bulletList", "listItem").run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-8": () => this.editor!.runCommand("toggleBulletList"),
    };
  },

  addInputRules() {
    return [
      {
        find: /^\s*([-+*])\s$/,
        handler: ({ chain }: any) => {
          chain().toggleBulletList().run();
        },
      },
    ];
  },
});

export default BulletList;

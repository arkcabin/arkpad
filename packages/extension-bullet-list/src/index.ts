import { Extension, ArkpadCommandProps } from "@arkpad/core";
import ListItem from "@arkpad/extension-list-item";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleBulletList: () => void;
  }
}

export const BulletList = Extension.create({
  name: "bulletList",

  activeMapping: {
    toggleBulletList: "bulletList",
  },

  addExtensions() {
    return [ListItem];
  },

  addNodes() {
    return {
      bullet_list: {
        content: "list_item+",
        group: "block",
        trailingNode: true,
        parseDOM: [{ tag: "ul" }],
        toDOM() {
          return ["ul", 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleBulletList:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleList("bullet_list", "list_item").run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-8": () => this.editor!.runCommand("toggleBulletList"),
    };
  },
});

export default BulletList;

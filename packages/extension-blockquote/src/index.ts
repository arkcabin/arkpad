import { Node, ArkpadCommandProps, NodeRole } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setBlockquote: () => void;
    toggleBlockquote: () => void;
    unsetBlockquote: () => void;
  }
}

export interface BlockquoteOptions {
  HTMLAttributes: Record<string, any>;
}

export const Blockquote = Node.create<BlockquoteOptions>({
  name: "blockquote",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "paragraph block*",
  marks: "_",
  group: "block",
  role: NodeRole.LAYOUT,
  defining: true,
  trailingNode: true,

  parseHTML() {
    return [{ tag: "blockquote" }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ["blockquote", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setBlockquote:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleBlock("blockquote").run();
        },
      toggleBlockquote:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleBlock("blockquote").run();
        },
      unsetBlockquote:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().setNode("paragraph").run();
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

import { Node, ArkpadCommandProps, PMNode, } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setHeading: (attrs: { level: number }) => void;
    toggleHeading: (attrs: { level: number }) => void;
  }
}

export interface HeadingOptions {
  levels: number[];
  HTMLAttributes: Record<string, any>;
}

export const Heading = Node.create<HeadingOptions>({
  name: "heading",

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
      HTMLAttributes: {},
    };
  },

  content: "inline*",
  group: "block",
  defining: true,

  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
      },
    };
  },

  parseHTML() {
    return this.options.levels.map((level: number) => ({
      tag: `h${level}`,
      getAttrs: () => ({ level }),
    }));
  },

  renderHTML({ node, HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level = hasLevel ? node.attrs.level : this.options.levels[0];

    return [`h${level}`, { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setHeading:
        (attrs: { level: number }) =>
          ({ chain }: ArkpadCommandProps) => {
            return chain().toggleBlock("heading", attrs);
          },
      toggleHeading:
        (attrs: { level: number }) =>
          ({ chain }: ArkpadCommandProps) => {
            return chain().toggleBlock("heading", attrs);
          },
    };
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (shortcuts, level) => ({
        ...shortcuts,
        [`Mod-Alt-${level}`]: () => this.editor?.runCommand("toggleHeading", { level }),
      }),
      {}
    );
  },
});

export default Heading;

import { Extension, ArkpadCommandProps } from "@arkpad/core";

export interface HeadingOptions {
  levels: number[];
}

export const Heading = Extension.create<HeadingOptions>({
  name: "heading",

  activeMapping: {
    toggleHeading: "heading",
  },

  addOptions() {
    return {
      levels: [1, 2, 3, 4, 5, 6],
    };
  },

  addNodes() {
    return {
      heading: {
        attrs: { level: { default: 1 } },
        content: "inline*",
        marks: "_",
        group: "block",
        defining: true,
        parseDOM: this.options.levels.map((level) => ({
          tag: `h${level}`,
          attrs: { level },
        })),
        toDOM(node: any) {
          return [`h${node.attrs.level}`, 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleHeading:
        (attrs: { level: number }) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleBlock("heading", attrs).run();
        },
    };
  },

  addKeyboardShortcuts() {
    return this.options.levels.reduce(
      (shortcuts, level) => ({
        ...shortcuts,
        [`Mod-Alt-${level}`]: () => this.editor!.runCommand("toggleHeading", { level }),
      }),
      {}
    );
  },
});

export default Heading;

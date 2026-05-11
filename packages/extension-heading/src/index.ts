import { Node, ArkpadCommandProps, PMNode, setBlockType } from "@arkpad/core";

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

  content: "text*",
  group: "block",
  defining: true,
  trailingNode: true,

  activeMapping: {
    h1: "heading",
    h2: "heading",
    h3: "heading",
    h4: "heading",
    h5: "heading",
    h6: "heading",
  },

  addAttributes() {
    return {
      level: {
        default: 1,
        rendered: false,
        // Ensure the attribute value is strictly checked as a number for active state matching
        keepOnSplit: true,
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
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { schema } = state;
          const type = schema.nodes.heading;
          if (!type) return false;

          const level = typeof attrs.level === "string" ? parseInt(attrs.level, 10) : attrs.level;

          return setBlockType(type, { level })(state, dispatch);
        },
      toggleHeading:
        (attrs: { level: number }) =>
        ({ state, dispatch, editor }: ArkpadCommandProps) => {
          const { schema, selection } = state;
          const type = schema.nodes.heading;
          if (!type) return false;

          const level = typeof attrs.level === "string" ? parseInt(attrs.level, 10) : attrs.level;

          const isActive = editor.isActive("heading", { level });

          if (isActive) {
            return setBlockType(schema.nodes.paragraph!)(state, dispatch);
          }

          return setBlockType(type, { level })(state, dispatch);
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

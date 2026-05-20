import { Node, ArkpadCommandProps, PMNode, setBlockType, NodeRole } from "@arkpad/core";

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
  role: NodeRole.CONTENT,
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
          if (!this.options.levels.includes(level)) return false;

          return setBlockType(type, { level })(state, dispatch);
        },
      toggleHeading:
        (attrs: { level: number }) =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { schema, selection } = state;
          const { $from } = selection;
          const type = schema.nodes.heading;
          if (!type) return false;

          const level = typeof attrs.level === "string" ? parseInt(attrs.level, 10) : attrs.level;
          if (!this.options.levels.includes(level)) return false;

          const node = $from.parent;
          const isCurrentHeading = node.type.name === "heading" && node.attrs.level === level;

          if (isCurrentHeading) {
            return setBlockType(schema.nodes.paragraph!, {})(state, dispatch);
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

  addInputRules() {
    const rules: any[] = [];
    for (const level of this.options.levels) {
      const hashes = "#".repeat(level);
      rules.push({
        find: new RegExp(`^(?:${hashes})\\s$`),
        handler: ({ chain }: any) => {
          chain().toggleHeading({ level }).run();
        },
      });
    }
    return rules;
  },
});

export default Heading;

import { Node, ArkpadCommandProps, PMNode, NodeRole } from "@arkpad/core";
import ListItem from "@arkpad/extension-list-item";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleOrderedList: (attrs?: { order?: number }) => void;
  }
}

export interface OrderedListOptions {
  HTMLAttributes: Record<string, any>;
}

export const OrderedList = Node.create<OrderedListOptions>({
  name: "orderedList",

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

  addAttributes() {
    return {
      order: {
        default: 1,
        parseHTML: (element: HTMLElement) => {
          return element.hasAttribute("start") ? parseInt(element.getAttribute("start")!, 10) : 1;
        },
        renderHTML: (attributes: Record<string, any>) => {
          if (attributes.order === 1) {
            return {};
          }
          return { start: attributes.order };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "ol" }];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    const { order, ...rest } = HTMLAttributes;
    return [
      "ol",
      { ...this.options.HTMLAttributes, ...rest, start: order !== 1 ? order : null },
      0,
    ];
  },

  addCommands() {
    return {
      toggleOrderedList:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleList("orderedList", "listItem").run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor!.runCommand("toggleOrderedList"),
    };
  },

  addInputRules() {
    return [
      {
        find: /^(\d+)\.\s$/,
        handler: ({ chain, match }: any) => {
          const order = parseInt(match[1], 10);
          chain().toggleOrderedList({ order }).run();
        },
      },
    ];
  },
});

export default OrderedList;

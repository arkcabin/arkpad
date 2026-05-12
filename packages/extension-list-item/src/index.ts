import { Node, ArkpadCommandProps, PMNode, NodeRole } from "@arkpad/core";
import { sinkListItem, liftListItem, splitListItem } from "prosemirror-schema-list";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    sinkListItem: () => void;
    liftListItem: () => void;
    splitListItem: () => void;
    indentList: () => void;
    outdentList: () => void;
  }
}

export const ListItem = Node.create({
  name: "listItem",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "block+",
  group: "block",
  role: NodeRole.LAYOUT,
  marks: "_",
  defining: true,

  parseHTML() {
    return [{ tag: "li" }];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return ["li", { ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      sinkListItem: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const type = state.schema.nodes.listItem;
        if (!type) return false;
        return sinkListItem(type)(state, dispatch);
      },
      liftListItem: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const type = state.schema.nodes.listItem;
        if (!type) return false;
        return liftListItem(type)(state, dispatch);
      },
      splitListItem: () => (props: ArkpadCommandProps) => {
        const { state, dispatch } = props;
        const type = state.schema.nodes.listItem;
        if (!type) return false;
        return splitListItem(type)(state, dispatch);
      },
      indentList: () => (props: ArkpadCommandProps) => props.editor.runCommand("sinkListItem"),
      outdentList: () => (props: ArkpadCommandProps) => props.editor.runCommand("liftListItem"),
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor!.runCommand("splitListItem"),
      Tab: () => this.editor!.runCommand("sinkListItem"),
      "Shift-Tab": () => this.editor!.runCommand("liftListItem"),
    };
  },
});

export default ListItem;

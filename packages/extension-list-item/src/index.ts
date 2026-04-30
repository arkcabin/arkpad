import { Extension } from "@arkpad/core";
import { sinkListItem, liftListItem, splitListItem } from "prosemirror-schema-list";

export const ListItem = Extension.create({
  name: "listItem",

  addNodes() {
    return {
      list_item: {
        content: "paragraph block*",
        marks: "_",
        defining: true,
        parseDOM: [{ tag: "li" }],
        toDOM() {
          return ["li", 0];
        },
      },
    };
  },

  addCommands() {
    return {
      sinkListItem: () => (props: any) => {
        const { state, dispatch } = props;
        const type = state.schema.nodes.list_item;
        if (!type) return false;
        return sinkListItem(type)(state, dispatch);
      },
      liftListItem: () => (props: any) => {
        const { state, dispatch } = props;
        const type = state.schema.nodes.list_item;
        if (!type) return false;
        return liftListItem(type)(state, dispatch);
      },
      splitListItem: () => (props: any) => {
        const { state, dispatch } = props;
        const type = state.schema.nodes.list_item;
        if (!type) return false;
        return splitListItem(type)(state, dispatch);
      },
      indentList: () => () => this.editor.runCommand("sinkListItem"),
      outdentList: () => () => this.editor.runCommand("liftListItem"),
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.runCommand("splitListItem"),
      Tab: () => this.editor.runCommand("sinkListItem"),
      "Shift-Tab": () => this.editor.runCommand("liftListItem"),
    };
  },
});

export default ListItem;

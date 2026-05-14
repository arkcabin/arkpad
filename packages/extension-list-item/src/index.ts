import { Node, ArkpadCommandProps, PMNode, NodeRole } from "@arkpad/core";
import { sinkListItem, liftListItem, splitListItem } from "@arkpad/core";

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

  content: "paragraph block*",
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

        const { selection } = state;
        const { $from } = selection;

        // Find the listItem container
        let depth = $from.depth;
        let listItemDepth = -1;
        while (depth > 0) {
          if ($from.node(depth).type === type) {
            listItemDepth = depth;
            break;
          }
          depth--;
        }

        if (listItemDepth === -1) return false;

        const listNode = $from.node(listItemDepth);

        // Smart Exit (Breakout): If the list item is empty, lift it
        // We check textContent and child count to be robust.
        // A truly empty list item usually has one empty paragraph.
        const isEmpty = listNode.textContent.trim().length === 0 && listNode.childCount <= 1;

        if (isEmpty) {
          if (dispatch) {
            return liftListItem(type)(state, dispatch);
          }
          return true;
        }

        if (dispatch) {
          const { tr } = state;
          // Force split at the listItem level
          try {
            // The second argument to tr.split is the NUMBER OF LEVELS to split.
            // To split up to the listItem, we need: (current depth - listItem parent depth)
            const levelsToSplit = $from.depth - (listItemDepth - 1);
            tr.split($from.pos, levelsToSplit);
            dispatch(tr);
            return true;
          } catch {
            // Fallback to standard split if manual split fails
            return splitListItem(type)(state, dispatch);
          }
        }
        return true;
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

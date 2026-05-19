import { Node, ArkpadCommandProps, PMNode, NodeRole } from "@arkpad/core";
import { liftListItem, splitListItem } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleTaskItem: () => void;
    splitTaskItem: () => void;
  }
}

export const TaskItem = Node.create({
  name: "taskItem",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "block+",
  group: "block",
  role: NodeRole.LAYOUT,
  defining: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-checked") === "true",
        renderHTML: (attributes: Record<string, any>) => ({
          "data-checked": attributes.checked,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "li[data-type='taskItem']" }];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return [
      "li",
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        "data-type": "taskItem",
      },
      0,
    ];
  },

  addCommands() {
    return {
      splitTaskItem:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { selection, schema } = state;
          const { $from } = selection;
          const type = schema.nodes.taskItem;

          if (!type) return false;

          // Find the taskItem container
          let depth = $from.depth;
          let taskItemDepth = -1;
          while (depth > 0) {
            if ($from.node(depth).type === type) {
              taskItemDepth = depth;
              break;
            }
            depth--;
          }

          if (taskItemDepth === -1) return false;

          const taskItemNode = $from.node(taskItemDepth);

          // Smart Exit (Breakout): If the task item is empty, lift it
          // We check textContent and child count to be robust.
          const isEmpty =
            taskItemNode.textContent.trim().length === 0 && taskItemNode.childCount <= 1;

          if (isEmpty) {
            if (dispatch) {
              return liftListItem(type)(state, dispatch);
            }
            return true;
          }

          if (dispatch) {
            const { tr } = state;
            // Force split at the taskItem level (depth of the taskItem node)
            // tr.split(pos, depth) splits all nodes from current depth up to specified depth
            try {
              // The second argument to tr.split is the NUMBER OF LEVELS to split.
              // To split up to the taskItem, we need: (current depth - taskItem parent depth)
              const levelsToSplit = $from.depth - (taskItemDepth - 1);
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
      toggleTaskItem:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { selection, tr } = state;
          const { $from } = selection;
          const type = state.schema.nodes.taskItem;
          if (!type) return false;

          let depth = $from.depth;
          let pos = -1;
          while (depth > 0) {
            if ($from.node(depth).type === type) {
              pos = $from.before(depth);
              break;
            }
            depth--;
          }

          if (pos > -1) {
            const node = state.doc.nodeAt(pos);
            if (!node) return false;
            if (dispatch) {
              dispatch(
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  checked: !node.attrs.checked,
                })
              );
            }
            return true;
          }
          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor!.runCommand("splitTaskItem"),
      Tab: () => this.editor!.runCommand("sinkListItem"),
      "Shift-Tab": () => this.editor!.runCommand("liftListItem"),
    };
  },
});

export default TaskItem;

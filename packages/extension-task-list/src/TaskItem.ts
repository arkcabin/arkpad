import { Node, ArkpadCommandProps, PMNode } from "@arkpad/core";
import { liftListItem, splitListItem } from "prosemirror-schema-list";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleTaskItem: () => void;
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
      Enter:
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

          const taskNode = $from.node(taskItemDepth);

          // Smart Exit (Breakout): If the task item is empty, lift it
          const isEmpty = taskNode.textContent.trim().length === 0;

          if (isEmpty) {
            return liftListItem(type)(state, dispatch);
          }

          // High-Precision Split
          // We use the native splitListItem which handles text selections and splitting nested blocks
          return splitListItem(type)(state, dispatch);
        },
      Tab: () => this.editor!.runCommand("sinkListItem"),
      "Shift-Tab": () => this.editor!.runCommand("liftListItem"),
    };
  },
});

export default TaskItem;

import { Extension, ArkpadCommandProps } from "@arkpad/core";
import { wrappingInputRule } from "prosemirror-inputrules";
import { splitListItem } from "prosemirror-schema-list";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleTaskItem: () => void;
    toggleTaskList: () => void;
  }
}


export const TaskItem = Extension.create({
  name: "taskItem",

  addNodes() {
    return {
      task_item: {
        content: "paragraph block*",
        defining: true,
        attrs: {
          checked: { default: false },
        },
        parseDOM: [
          {
            tag: "li[data-type='task_item']",
            getAttrs: (dom: HTMLElement) => ({
              checked: dom.getAttribute("data-checked") === "true",
            }),
          },
        ],
        toDOM(node: any) {
          return [
            "li",
            {
              "data-type": "task_item",
              "data-checked": node.attrs.checked ? "true" : "false",
              class: "task-item",
            },
            [
              "label",
              [
                "input",
                {
                  type: "checkbox",
                  checked: node.attrs.checked ? "checked" : null,
                  // We add a class for the CSS to handle the interactive part
                  class: "task-checkbox",
                },
              ],
              ["span"],
            ],
            ["div", 0],
          ];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleTaskItem: () => ({ state, dispatch }: ArkpadCommandProps) => {
        const { $from } = state.selection;
        const type = state.schema.nodes.task_item;
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
          const tr = state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            checked: !node.attrs.checked,
          });
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: (state: any, dispatch: any) => {
        const type = state.schema.nodes.task_item;
        if (!type) return false;
        return splitListItem(type)(state, dispatch);
      },
    };
  },
});

export const TaskList = Extension.create({
  name: "taskList",

  addExtensions() {
    return [TaskItem];
  },

  addNodes() {
    return {
      task_list: {
        content: "task_item+",
        group: "block",
        trailingNode: true,
        parseDOM: [{ tag: "ul[data-type='task_list']" }],
        toDOM() {
          return ["ul", { "data-type": "task_list", class: "task-list" }, 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleTaskList: () => ({ chain }: ArkpadCommandProps) => {
        return chain().toggleList("task_list", "task_item").run();
      },
    };
  },

  addInputRules(schema) {
    return [
      wrappingInputRule(/^\[\s?\]\s$/, schema.nodes.task_list),
      wrappingInputRule(/^\[x\]\s$/, schema.nodes.task_list, { checked: true }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-9": () => this.editor!.runCommand("toggleTaskList"),
    };
  },
});

export default TaskList;

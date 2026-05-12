import { Node, ArkpadCommandProps, PMNode, NodeRole } from "@arkpad/core";
import { wrappingInputRule } from "prosemirror-inputrules";
import { Schema } from "prosemirror-model";
import TaskItem from "./TaskItem";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    toggleTaskList: () => void;
  }
}

export interface TaskListOptions {
  HTMLAttributes: Record<string, any>;
}

export const TaskList = Node.create<TaskListOptions>({
  name: "taskList",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addExtensions() {
    return [TaskItem];
  },

  group: "block",
  role: NodeRole.LAYOUT,
  content: "taskItem+",
  trailingNode: true,

  parseHTML() {
    return [{ tag: "ul[data-type='taskList']" }];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return [
      "ul",
      {
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
        "data-type": "taskList",
        class: "task-list",
      },
      0,
    ];
  },

  addCommands() {
    return {
      toggleTaskList:
        () =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleList("taskList", "taskItem").run();
        },
    };
  },

  addInputRules(schema: Schema) {
    const type = schema.nodes.taskList;
    if (!type) return [];

    return [
      wrappingInputRule(/^\[\s?\]\s$/, type),
      wrappingInputRule(/^\[x\]\s$/, type, { checked: true }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-9": () => this.editor!.runCommand("toggleTaskList"),
    };
  },
});

export default TaskList;

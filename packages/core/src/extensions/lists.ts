import { sinkListItem, liftListItem, splitListItem } from "prosemirror-schema-list";
import { Extension } from "../extensions-types";
import { toggleList } from "./utils";

export function createBulletList(): Extension {
  return {
    name: "bulletList",
    addCommands: () => ({
      toggleBulletList: () => (state: any, dispatch: any) => {
        return toggleList(state.schema.nodes.bulletList!, state.schema.nodes.listItem!)(state, dispatch);
      },
    }),
  };
}

export function createOrderedList(): Extension {
  return {
    name: "orderedList",
    addCommands: () => ({
      toggleOrderedList: () => (state: any, dispatch: any) => {
        return toggleList(state.schema.nodes.orderedList!, state.schema.nodes.listItem!)(state, dispatch);
      },
    }),
  };
}

export function createListItem(): Extension {
  return {
    name: "listItem",
    addCommands: () => ({
      sinkListItem: () => (state: any, dispatch: any) => sinkListItem(state.schema.nodes.listItem!)(state, dispatch),
      liftListItem: () => (state: any, dispatch: any) => liftListItem(state.schema.nodes.listItem!)(state, dispatch),
      splitListItem: () => (state: any, dispatch: any) => splitListItem(state.schema.nodes.listItem!)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      Enter: (state: any, dispatch: any) => splitListItem(state.schema.nodes.listItem!)(state, dispatch),
      Tab: (state: any, dispatch: any) => sinkListItem(state.schema.nodes.listItem!)(state, dispatch),
      "Shift-Tab": (state: any, dispatch: any) => liftListItem(state.schema.nodes.listItem!)(state, dispatch),
    }),
  };
}

export function createTaskList(): Extension {
  return {
    name: "taskList",
    addCommands: () => ({
      toggleTaskList: () => (state: any, dispatch: any) => {
        return toggleList(state.schema.nodes.taskList!, state.schema.nodes.taskItem!)(state, dispatch);
      },
    }),
  };
}

export function createTaskItem(): Extension {
  return {
    name: "taskItem",
    addCommands: () => ({
      toggleTaskItem: () => (state: any, dispatch: any) => {
        const { $from } = state.selection;
        const node = $from.nodeAfter || $from.parent;
        if (node && (node.type.name === 'taskItem' || node.type.name === 'taskList')) {
          const newAttrs = { ...node.attrs, checked: !node.attrs.checked };
          const tr = state.tr.setNodeMarkup($from.pos, undefined, newAttrs);
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
    }),
    addKeyboardShortcuts: () => ({
      Enter: (state: any, dispatch: any) => splitListItem(state.schema.nodes.taskItem!)(state, dispatch),
      Tab: (state: any, dispatch: any) => sinkListItem(state.schema.nodes.taskItem!)(state, dispatch),
      "Shift-Tab": (state: any, dispatch: any) => liftListItem(state.schema.nodes.taskItem!)(state, dispatch),
    }),
  };
}

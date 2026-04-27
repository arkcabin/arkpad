import { sinkListItem, liftListItem, splitListItem } from "prosemirror-schema-list";
import { wrappingInputRule } from "prosemirror-inputrules";
import { Extension } from "../extensions-types";
import { toggleList } from "./utils";

export function createBulletList(): Extension {
  return {
    name: "bulletList",
    addCommands: () => ({
      toggleBulletList: () => (state: any, dispatch: any) => {
        return toggleList(state.schema.nodes.bulletList!, state.schema.nodes.listItem!)(
          state,
          dispatch
        );
      },
    }),
    addInputRules: (schema) => [wrappingInputRule(/^\s*([-*])\s$/, schema.nodes.bulletList!)],
  };
}

export function createOrderedList(): Extension {
  return {
    name: "orderedList",
    addCommands: () => ({
      toggleOrderedList: () => (state: any, dispatch: any) => {
        return toggleList(state.schema.nodes.orderedList!, state.schema.nodes.listItem!)(
          state,
          dispatch
        );
      },
    }),
    addInputRules: (schema) => [
      wrappingInputRule(
        /^(\d+)\.\s$/,
        schema.nodes.orderedList!,
        (match) => ({ order: +match[1]! }),
        (match, node) => node.childCount + node.attrs.order === +match[1]!
      ),
    ],
  };
}

export function createListItem(): Extension {
  return {
    name: "listItem",
    addCommands: () => ({
      sinkListItem: () => (state: any, dispatch: any) =>
        sinkListItem(state.schema.nodes.listItem!)(state, dispatch),
      liftListItem: () => (state: any, dispatch: any) =>
        liftListItem(state.schema.nodes.listItem!)(state, dispatch),
      splitListItem: () => (state: any, dispatch: any) =>
        splitListItem(state.schema.nodes.listItem!)(state, dispatch),
      indentList: () => (state: any, dispatch: any) => {
        const { $from } = state.selection;
        const listItem = state.schema.nodes.listItem;
        const taskItem = state.schema.nodes.taskItem;

        let depth = $from.depth;
        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type === listItem) return sinkListItem(listItem)(state, dispatch);
          if (node.type === taskItem) return sinkListItem(taskItem)(state, dispatch);
          depth--;
        }
        return false;
      },
      outdentList: () => (state: any, dispatch: any) => {
        const { $from } = state.selection;
        const listItem = state.schema.nodes.listItem;
        const taskItem = state.schema.nodes.taskItem;

        let depth = $from.depth;
        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type === listItem) return liftListItem(listItem)(state, dispatch);
          if (node.type === taskItem) return liftListItem(taskItem)(state, dispatch);
          depth--;
        }
        return false;
      },
    }),
    addKeyboardShortcuts: () => ({
      Enter: (state: any, dispatch: any) =>
        splitListItem(state.schema.nodes.listItem!)(state, dispatch),
      Tab: (state: any, dispatch: any) => {
        const { $from } = state.selection;
        const listItem = state.schema.nodes.listItem;
        const taskItem = state.schema.nodes.taskItem;

        let depth = $from.depth;
        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type === listItem) return sinkListItem(listItem)(state, dispatch);
          if (node.type === taskItem) return sinkListItem(taskItem)(state, dispatch);
          depth--;
        }
        return false;
      },
      "Shift-Tab": (state: any, dispatch: any) => {
        const { $from } = state.selection;
        const listItem = state.schema.nodes.listItem;
        const taskItem = state.schema.nodes.taskItem;

        let depth = $from.depth;
        while (depth > 0) {
          const node = $from.node(depth);
          if (node.type === listItem) return liftListItem(listItem)(state, dispatch);
          if (node.type === taskItem) return liftListItem(taskItem)(state, dispatch);
          depth--;
        }
        return false;
      },
    }),
  };
}

export function createTaskList(): Extension {
  return {
    name: "taskList",
    addCommands: () => ({
      toggleTaskList: () => (state: any, dispatch: any) => {
        return toggleList(state.schema.nodes.taskList!, state.schema.nodes.taskItem!)(
          state,
          dispatch
        );
      },
    }),
    addInputRules: (schema) => [
      wrappingInputRule(/^\[\s?\]\s$/, schema.nodes.taskList!),
      wrappingInputRule(/^\[x\]\s$/, schema.nodes.taskList!, { checked: true }),
    ],
  };
}

export function createTaskItem(): Extension {
  return {
    name: "taskItem",
    addCommands: () => ({
      toggleTaskItem: () => (state: any, dispatch: any) => {
        const { $from } = state.selection;
        const node = $from.nodeAfter || $from.parent;
        if (node && (node.type.name === "taskItem" || node.type.name === "taskList")) {
          const newAttrs = { ...node.attrs, checked: !node.attrs.checked };
          const tr = state.tr.setNodeMarkup($from.pos, undefined, newAttrs);
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
    }),
    addKeyboardShortcuts: () => ({
      Enter: (state: any, dispatch: any) => {
        const { $from, $to } = state.selection;
        if (!$from.sameParent($to) || $from.parent.type.name !== "paragraph") return false;

        const taskItem = state.schema.nodes.taskItem;
        if (!taskItem) return false;

        // Check if we are inside a taskItem
        let depth = $from.depth;
        while (depth > 0) {
          if ($from.node(depth).type === taskItem) break;
          depth--;
        }

        if (depth === 0) return false;

        // If current task item is empty, lift it instead of splitting
        if ($from.parent.content.size === 0) {
          return liftListItem(taskItem)(state, dispatch);
        }

        return splitListItem(taskItem, { checked: false })(state, dispatch);
      },
      Backspace: (state: any, dispatch: any) => {
        const { $from, $to } = state.selection;
        if (!$from.sameParent($to) || $from.parentOffset !== 0) return false;

        const taskItem = state.schema.nodes.taskItem;
        if (!taskItem) return false;

        let depth = $from.depth;
        while (depth > 0) {
          if ($from.node(depth).type === taskItem) break;
          depth--;
        }

        if (depth === 0) return false;

        // Turn back into paragraph if at the start
        return liftListItem(taskItem)(state, dispatch);
      },
      Tab: (state: any, dispatch: any) =>
        sinkListItem(state.schema.nodes.taskItem!)(state, dispatch),
      "Shift-Tab": (state: any, dispatch: any) =>
        liftListItem(state.schema.nodes.taskItem!)(state, dispatch),
    }),
  };
}

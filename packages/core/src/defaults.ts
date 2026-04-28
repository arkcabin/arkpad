import { baseKeymap, setBlockType, toggleMark } from "prosemirror-commands";
import { history, redo, undo } from "prosemirror-history";
import { inputRules, textblockTypeInputRule, wrappingInputRule } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { liftListItem, sinkListItem, wrapInList } from "prosemirror-schema-list";
import type { Command, Plugin } from "prosemirror-state";

import { arkpadSchema } from "./schema";

export function createDefaultPlugins(): Plugin[] {
  const rules = [
    textblockTypeInputRule(/^#{1}\s$/, arkpadSchema.nodes.heading!, { level: 1 }),
    textblockTypeInputRule(/^#{2}\s$/, arkpadSchema.nodes.heading!, { level: 2 }),
    wrappingInputRule(/^\s*[-*]\s$/, arkpadSchema.nodes.bullet_list!),
  ];

  return [
    inputRules({ rules }),
    history(),
    keymap({
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
    }),
    keymap(baseKeymap),
  ];
}

export function createDefaultCommands(): Record<string, Command> {
  const insertHardBreak: Command = (state, dispatch) => {
    if (!dispatch) {
      return true;
    }

    const hardBreak = arkpadSchema.nodes.hard_break!.create();
    dispatch(state.tr.replaceSelectionWith(hardBreak).scrollIntoView());
    return true;
  };

  return {
    toggleBold: toggleMark(arkpadSchema.marks.strong!),
    toggleItalic: toggleMark(arkpadSchema.marks.em!),
    toggleCode: toggleMark(arkpadSchema.marks.code!),
    setParagraph: setBlockType(arkpadSchema.nodes.paragraph!),
    setHeading1: setBlockType(arkpadSchema.nodes.heading!, { level: 1 }),
    setHeading2: setBlockType(arkpadSchema.nodes.heading!, { level: 2 }),
    bulletList: wrapInList(arkpadSchema.nodes.bullet_list!),
    sinkListItem: sinkListItem(arkpadSchema.nodes.list_item!),
    liftListItem: liftListItem(arkpadSchema.nodes.list_item!),
    hardBreak: insertHardBreak,
    undo,
    redo,
  };
}

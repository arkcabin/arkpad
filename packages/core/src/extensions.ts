import { type Schema } from "prosemirror-model";
import { type Plugin, type Transaction } from "prosemirror-state";
import { toggleMark, setBlockType, wrapIn } from "prosemirror-commands";
import { wrapInList, sinkListItem, liftListItem } from "prosemirror-schema-list";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";

import { arkpadSchema } from "./schema";

type Dispatch = (tr: Transaction) => void;

export type { Dispatch };

export interface Extension {
  name: string;
  type?: string;
  getOptions?: () => Record<string, unknown>;
  addCommands?: () => Record<string, any>;
  addKeyboardShortcuts?: () => Record<string, any>;
  addInputRules?: () => Plugin[];
  addPasteRules?: () => Plugin[];
  addProseMirrorPlugins?: () => Plugin[];
}

export class ExtensionManager {
  public schema: Schema;
  public extensions: Extension[] = [];
  public commands: Record<string, any> = {};
  public keyboardShortcuts: Record<string, any> = {};
  public inputRules: Plugin[] = [];
  public pasteRules: Plugin[] = [];
  public proseMirrorPlugins: Plugin[] = [];

  constructor(schema: Schema, extensions: Extension[] = []) {
    this.schema = schema;
    this.registerExtensions(extensions);
  }

  registerExtensions(extensions: Extension[]): void {
    for (const extension of extensions) {
      this.registerExtension(extension);
    }
    this.commands = this.collectCommands();
    this.keyboardShortcuts = this.collectKeyboardShortcuts();
    this.inputRules = this.collectInputRules();
  }

  registerExtension(extension: Extension): void {
    this.extensions.push(extension);
  }

  private collectCommands() {
    const commands: Record<string, any> = {};
    for (const ext of this.extensions) {
      if (ext.addCommands) {
        Object.assign(commands, ext.addCommands());
      }
    }
    return commands;
  }

  private collectKeyboardShortcuts() {
    const shortcuts: Record<string, any> = {};
    for (const ext of this.extensions) {
      if (ext.addKeyboardShortcuts) {
        Object.assign(shortcuts, ext.addKeyboardShortcuts());
      }
    }
    return shortcuts;
  }

  private collectInputRules(): Plugin[] {
    const rules: Plugin[] = [];
    for (const ext of this.extensions) {
      if (ext.addInputRules) {
        rules.push(...ext.addInputRules());
      }
    }
    return rules;
  }

  get(name: string): Extension | undefined {
    return this.extensions.find((ext) => ext.name === name);
  }
}

// MARK EXTENSIONS
function createBold(): Extension {
  return {
    name: "bold",
    addCommands: () => ({
      toggleBold: (state: any, dispatch: any) => toggleMark(arkpadSchema.marks.strong!)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-b": (state: any, dispatch: any) => toggleMark(arkpadSchema.marks.strong!)(state, dispatch),
    }),
  };
}

function createItalic(): Extension {
  return {
    name: "italic",
    addCommands: () => ({
      toggleItalic: (state: any, dispatch: any) => toggleMark(arkpadSchema.marks.em!)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-i": (state: any, dispatch: any) => toggleMark(arkpadSchema.marks.em!)(state, dispatch),
    }),
  };
}

function createStrike(): Extension {
  return {
    name: "strike",
    addCommands: () => ({
      toggleStrike: (state: any, dispatch: any) => toggleMark(arkpadSchema.marks.strike!)(state, dispatch),
    }),
  };
}

function createCode(): Extension {
  return {
    name: "code",
    addCommands: () => ({
      toggleCode: (state: any, dispatch: any) => toggleMark(arkpadSchema.marks.code!)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-e": (state: any, dispatch: any) => toggleMark(arkpadSchema.marks.code!)(state, dispatch),
    }),
  };
}

function createLink(): Extension {
  return {
    name: "link",
    addCommands: () => ({
      setLink: (href: string) => (state: any, dispatch: any) => {
        if (!href) {
          return toggleMark(arkpadSchema.marks.link!)(state, dispatch);
        }
        const mark = arkpadSchema.marks.link!.create({ href });
        const { $from, $to } = state.selection;
        const tr = state.tr;
        tr.addMark($from.pos, $to.pos, mark);
        if (dispatch) dispatch(tr);
        return true;
      },
      unsetLink: (state: any, dispatch: any) => {
        const { $from, $to } = state.selection;
        const tr = state.tr;
        tr.removeMark($from.pos, $to.pos, arkpadSchema.marks.link!);
        if (dispatch) dispatch(tr);
        return true;
      },
    }),
    addKeyboardShortcuts: () => ({
      "Mod-k": (state: any, dispatch: any) => {
        const mark = arkpadSchema.marks.link!.create({ href: "https://" });
        const { $from, $to } = state.selection;
        const tr = state.tr;
        tr.addMark($from.pos, $to.pos, mark);
        if (dispatch) dispatch(tr);
        return true;
      },
    }),
  };
}

// BLOCK NODE EXTENSIONS
function createDocument(): Extension {
  return { name: "doc", addCommands: () => ({}) };
}

function createParagraph(): Extension {
  return {
    name: "paragraph",
    addCommands: () => ({
      setParagraph: (state: any, dispatch: any) => setBlockType(arkpadSchema.nodes.paragraph!)(state, dispatch),
    }),
  };
}

function createText(): Extension {
  return { name: "text", addCommands: () => ({}) };
}

function createHeading(): Extension {
  return {
    name: "heading",
    addCommands: () => ({
      toggleHeading: (level: number) => (state: any, dispatch: any) =>
        setBlockType(arkpadSchema.nodes.heading!, { level })(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Alt-1": (state: any, dispatch: any) => setBlockType(arkpadSchema.nodes.heading!, { level: 1 })(state, dispatch),
      "Mod-Alt-2": (state: any, dispatch: any) => setBlockType(arkpadSchema.nodes.heading!, { level: 2 })(state, dispatch),
      "Mod-Alt-3": (state: any, dispatch: any) => setBlockType(arkpadSchema.nodes.heading!, { level: 3 })(state, dispatch),
    }),
  };
}

function createBlockquote(): Extension {
  return {
    name: "blockquote",
    addCommands: () => ({
      setBlockquote: (state: any, dispatch: any) => wrapIn(arkpadSchema.nodes.blockquote!)(state, dispatch),
    }),
  };
}

function createCodeBlock(): Extension {
  return {
    name: "codeBlock",
    addCommands: () => ({
      toggleCodeBlock: (state: any, dispatch: any) => setBlockType(arkpadSchema.nodes.code_block!)(state, dispatch),
    }),
  };
}

function createHardBreak(): Extension {
  return {
    name: "hardBreak",
    addCommands: () => ({
      setHardBreak: (state: any, dispatch: any) => {
        const { $from } = state.selection;
        if ($from.parent.type.content.size === $from.parent.content.size) {
          const node = arkpadSchema.nodes.hard_break!.create();
          const tr = state.tr.insert($from.pos, node);
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
    }),
  };
}

function createHorizontalRule(): Extension {
  return {
    name: "horizontalRule",
    addCommands: () => ({
      setHorizontalRule: (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.horizontal_rule!.create();
        const tr = state.tr.replaceSelectionWith(node);
        if (dispatch) dispatch(tr);
        return true;
      },
    }),
  };
}

function createImage(): Extension {
  return {
    name: "image",
    addCommands: () => ({
      setImage: (src: string) => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.image!.create({ src });
        const tr = state.tr.replaceSelectionWith(node);
        if (dispatch) dispatch(tr);
        return true;
      },
    }),
  };
}

// LIST EXTENSIONS
function createBulletList(): Extension {
  return {
    name: "bulletList",
    addCommands: () => ({
      toggleBulletList: (state: any, dispatch: any) => wrapInList(arkpadSchema.nodes.bullet_list!)(state, dispatch),
    }),
  };
}

function createOrderedList(): Extension {
  return {
    name: "orderedList",
    addCommands: () => ({
      toggleOrderedList: (state: any, dispatch: any) => wrapInList(arkpadSchema.nodes.ordered_list!)(state, dispatch),
    }),
  };
}

function createListItem(): Extension {
  return {
    name: "listItem",
    addCommands: () => ({
      sinkListItem: (state: any, dispatch: any) => sinkListItem(arkpadSchema.nodes.list_item!)(state, dispatch),
      liftListItem: (state: any, dispatch: any) => liftListItem(arkpadSchema.nodes.list_item!)(state, dispatch),
    }),
  };
}

function createTaskList(): Extension {
  return {
    name: "taskList",
    addCommands: () => ({
      toggleTaskList: (state: any, dispatch: any) => wrapInList(arkpadSchema.nodes.task_list!)(state, dispatch),
    }),
  };
}

function createTaskItem(): Extension {
  return {
    name: "taskItem",
    addCommands: () => ({
      toggleTaskItem: (state: any, dispatch: any) => setBlockType(arkpadSchema.nodes.task_item!)(state, dispatch),
    }),
  };
}

// Make taskItem available but not in default StarterKit (requires schema support)
export { createTaskItem };

// UTILITY EXTENSIONS
function createHistory(): Extension {
  return {
    name: "history",
    addCommands: () => ({
      undo: (state: any, dispatch: any) => undo(state, dispatch),
      redo: (state: any, dispatch: any) => redo(state, dispatch),
    }),
    addProseMirrorPlugins: () => [history(), keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo })],
  };
}

function createPlaceholder(): Extension {
  return {
    name: "placeholder",
    addProseMirrorPlugins: () => [],
  };
}

function createGapCursor(): Extension {
  return { name: "gapCursor", addCommands: () => ({}) };
}

function createDropCursor(): Extension {
  return { name: "dropCursor", addCommands: () => ({}) };
}

// STARTER KIT - bundles all common extensions
export const StarterKit: Extension[] = [
  createDocument(),
  createParagraph(),
  createText(),
  createHeading(),
  createBlockquote(),
  createBulletList(),
  createOrderedList(),
  createTaskList(),
  createListItem(),
  createCodeBlock(),
  createHardBreak(),
  createHorizontalRule(),
  createImage(),
  createBold(),
  createItalic(),
  createStrike(),
  createCode(),
  createLink(),
  createGapCursor(),
  createDropCursor(),
  createPlaceholder(),
  createHistory(),
];

export function createDefaultExtensions(): Extension[] {
  return StarterKit;
}
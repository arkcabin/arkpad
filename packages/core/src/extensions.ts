import { type Schema, type Node as PMNode } from "prosemirror-model";
import { Plugin, type Transaction } from "prosemirror-state";
import { toggleMark, setBlockType, wrapIn, lift } from "prosemirror-commands";
import { wrapInList, sinkListItem, liftListItem, splitListItem } from "prosemirror-schema-list";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { inputRules, wrappingInputRule, textblockTypeInputRule } from "prosemirror-inputrules";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";

import { arkpadSchema } from "./schema";

type Dispatch = (tr: Transaction) => void;

export type { Dispatch };

export interface Extension {
  name: string;
  type?: string;
  getOptions?: () => Record<string, unknown>;
  addCommands?: () => Record<string, any>;
  addKeyboardShortcuts?: () => Record<string, any>;
  addInputRules?: () => any[];
  addPasteRules?: () => Plugin[];
  addProseMirrorPlugins?: () => Plugin[];
}

export class ExtensionManager {
  public schema: Schema;
  public extensions: Extension[] = [];
  public commands: Record<string, any> = {};
  public keyboardShortcuts: Record<string, any> = {};
  public inputRules: any[] = [];
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
    this.pasteRules = this.collectPasteRules();
    this.proseMirrorPlugins = this.collectProseMirrorPlugins();
  }

  registerExtension(extension: Extension): void {
    this.extensions.push(extension);
  }

  get(name: string): Extension | undefined {
    return this.extensions.find((ext) => ext.name === name);
  }

  getPlugins(): Plugin[] {
    return [
      inputRules({ rules: this.inputRules }),
      keymap(this.keyboardShortcuts),
      keymap(baseKeymap),
      ...this.proseMirrorPlugins,
    ];
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

  private collectInputRules(): any[] {
    const rules: any[] = [];
    for (const ext of this.extensions) {
      if (ext.addInputRules) {
        rules.push(...ext.addInputRules());
      }
    }
    return rules;
  }

  private collectPasteRules(): Plugin[] {
    const rules: Plugin[] = [];
    for (const ext of this.extensions) {
      if (ext.addPasteRules) {
        rules.push(...ext.addPasteRules());
      }
    }
    return rules;
  }

  private collectProseMirrorPlugins() {
    const plugins: Plugin[] = [];
    for (const ext of this.extensions) {
      if (ext.addProseMirrorPlugins) {
        plugins.push(...ext.addProseMirrorPlugins());
      }
    }
    return plugins;
  }
}

// MARK EXTENSIONS
function createBold(): Extension {
  return {
    name: "bold",
    addCommands: () => ({
      toggleBold: () => toggleMark(arkpadSchema.marks.strong!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-b": toggleMark(arkpadSchema.marks.strong!),
    }),
  };
}

function createItalic(): Extension {
  return {
    name: "italic",
    addCommands: () => ({
      toggleItalic: () => toggleMark(arkpadSchema.marks.em!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-i": toggleMark(arkpadSchema.marks.em!),
    }),
  };
}

function createStrike(): Extension {
  return {
    name: "strike",
    addCommands: () => ({
      toggleStrike: () => toggleMark(arkpadSchema.marks.strike!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-s": toggleMark(arkpadSchema.marks.strike!),
    }),
  };
}

function createUnderline(): Extension {
  return {
    name: "underline",
    addCommands: () => ({
      toggleUnderline: () => toggleMark(arkpadSchema.marks.underline!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-u": toggleMark(arkpadSchema.marks.underline!),
    }),
  };
}

function createCode(): Extension {
  return {
    name: "code",
    addCommands: () => ({
      toggleCode: () => toggleMark(arkpadSchema.marks.code!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-e": toggleMark(arkpadSchema.marks.code!),
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
      unsetLink: () => (state: any, dispatch: any) => {
        const { from, to } = state.selection;
        if (dispatch) dispatch(state.tr.removeMark(from, to, arkpadSchema.marks.link!));
        return true;
      },
      toggleLink: (href: string) => toggleMark(arkpadSchema.marks.link!, { href }),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-k": toggleMark(arkpadSchema.marks.link!, { href: "https://" }),
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
      setParagraph: () => setBlockType(arkpadSchema.nodes.paragraph!),
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
      toggleHeading: (attrs: { level: number }) => (state: any, dispatch: any) => {
        const { from, to } = state.selection;
        let isHeading = false;
        state.doc.nodesBetween(from, to, (node) => {
          if (node.type === arkpadSchema.nodes.heading && node.attrs.level === attrs.level) {
            isHeading = true;
          }
        });

        if (isHeading) {
          return setBlockType(arkpadSchema.nodes.paragraph!)(state, dispatch);
        }
        return setBlockType(arkpadSchema.nodes.heading!, attrs)(state, dispatch);
      },
      setHeading1: () => setBlockType(arkpadSchema.nodes.heading!, { level: 1 }),
      setHeading2: () => setBlockType(arkpadSchema.nodes.heading!, { level: 2 }),
      setHeading3: () => setBlockType(arkpadSchema.nodes.heading!, { level: 3 }),
      setHeading4: () => setBlockType(arkpadSchema.nodes.heading!, { level: 4 }),
      setHeading5: () => setBlockType(arkpadSchema.nodes.heading!, { level: 5 }),
      setHeading6: () => setBlockType(arkpadSchema.nodes.heading!, { level: 6 }),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Alt-1": setBlockType(arkpadSchema.nodes.heading!, { level: 1 }),
      "Mod-Alt-2": setBlockType(arkpadSchema.nodes.heading!, { level: 2 }),
      "Mod-Alt-3": setBlockType(arkpadSchema.nodes.heading!, { level: 3 }),
      "Mod-Alt-4": setBlockType(arkpadSchema.nodes.heading!, { level: 4 }),
      "Mod-Alt-5": setBlockType(arkpadSchema.nodes.heading!, { level: 5 }),
      "Mod-Alt-6": setBlockType(arkpadSchema.nodes.heading!, { level: 6 }),
    }),
    addInputRules: () => [
      textblockTypeInputRule(/^(#{1,6})\s$/, arkpadSchema.nodes.heading!, (match) => ({ level: match[1]?.length || 1 })),
    ],
  };
}

function createBlockquote(): Extension {
  return {
    name: "blockquote",
    addCommands: () => ({
      toggleBlockquote: () => (state: any, dispatch: any) => {
        const { $from, $to } = state.selection;
        const range = $from.blockRange($to);
        
        if (!range) return false;

        // Check if the selection is already wrapped in a blockquote
        const isBlockquote = range.parent.type === arkpadSchema.nodes.blockquote;

        if (isBlockquote) {
          // If it is, lift it out of the blockquote
          return lift(state, dispatch);
        }
        
        // Otherwise wrap it
        return wrapIn(arkpadSchema.nodes.blockquote!)(state, dispatch);
      },
      setBlockquote: () => wrapIn(arkpadSchema.nodes.blockquote!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-b": wrapIn(arkpadSchema.nodes.blockquote!),
    }),
    addInputRules: () => [
      wrappingInputRule(/^\s*>\s$/, arkpadSchema.nodes.blockquote!),
    ],
  };
}

function createCodeBlock(): Extension {
  return {
    name: "codeBlock",
    addCommands: () => ({
      toggleCodeBlock: () => (state: any, dispatch: any) => {
        const { from, to } = state.selection;
        let isCodeBlock = false;
        state.doc.nodesBetween(from, to, (node) => {
          if (node.type === arkpadSchema.nodes.code_block) {
            isCodeBlock = true;
          }
        });

        if (isCodeBlock) {
          return setBlockType(arkpadSchema.nodes.paragraph!)(state, dispatch);
        }
        return setBlockType(arkpadSchema.nodes.code_block!)(state, dispatch);
      },
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Alt-c": setBlockType(arkpadSchema.nodes.code_block!),
    }),
    addInputRules: () => [
      textblockTypeInputRule(/^```$/, arkpadSchema.nodes.code_block!),
    ],
  };
}

function createHardBreak(): Extension {
  return {
    name: "hardBreak",
    addCommands: () => ({
      setHardBreak: () => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.hard_break!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Enter": () => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.hard_break!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
      "Shift-Enter": () => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.hard_break!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
  };
}

function createHorizontalRule(): Extension {
  return {
    name: "horizontalRule",
    addCommands: () => ({
      setHorizontalRule: () => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.horizontal_rule!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
  };
}

function createImage(): Extension {
  return {
    name: "image",
    addCommands: () => ({
      setImage: (src: string, alt?: string, title?: string) => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.image!.create({ src, alt, title });
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
      toggleBulletList: () => wrapInList(arkpadSchema.nodes.bullet_list!),
    }),
    addInputRules: () => [
      wrappingInputRule(/^\s*([-*+])\s$/, arkpadSchema.nodes.bullet_list!, (match) => ({})),
    ],
  };
}

function createOrderedList(): Extension {
  return {
    name: "orderedList",
    addCommands: () => ({
      toggleOrderedList: () => wrapInList(arkpadSchema.nodes.ordered_list!),
    }),
    addInputRules: () => [
      wrappingInputRule(/^\s*(\d+)\.\s$/, arkpadSchema.nodes.ordered_list!, (match) => ({ order: match[1] ? +match[1] : 1 })),
    ],
  };
}

function createListItem(): Extension {
  return {
    name: "listItem",
    addCommands: () => ({
      sinkListItem: () => sinkListItem(arkpadSchema.nodes.list_item!),
      liftListItem: () => liftListItem(arkpadSchema.nodes.list_item!),
      splitListItem: () => splitListItem(arkpadSchema.nodes.list_item!),
    }),
    addKeyboardShortcuts: () => ({
      Enter: splitListItem(arkpadSchema.nodes.list_item!),
      Tab: sinkListItem(arkpadSchema.nodes.list_item!),
      "Shift-Tab": liftListItem(arkpadSchema.nodes.list_item!),
    }),
  };
}

function createTaskList(): Extension {
  return {
    name: "taskList",
    addCommands: () => ({
      toggleTaskList: () => wrapInList(arkpadSchema.nodes.task_list!),
    }),
    addInputRules: () => [
      wrappingInputRule(/^\s*(\[[ xX]\])\s$/, arkpadSchema.nodes.task_list!),
    ],
  };
}

function createTaskItem(): Extension {
  return {
    name: "taskItem",
    addCommands: () => ({
      toggleTaskItem: () => (state: any, dispatch: any) => {
        const { $from } = state.selection;
        const node = $from.nodeAfter || $from.parent;
        if (node && (node.type === arkpadSchema.nodes.task_item || node.type === arkpadSchema.nodes.task_list)) {
          const newAttrs = { ...node.attrs, checked: !node.attrs.checked };
          const tr = state.tr.setNodeMarkup($from.pos, undefined, newAttrs);
          if (dispatch) dispatch(tr);
          return true;
        }
        return setBlockType(arkpadSchema.nodes.task_item!)(state, dispatch);
      },
    }),
    addKeyboardShortcuts: () => ({
      Enter: splitListItem(arkpadSchema.nodes.task_item!),
      Tab: sinkListItem(arkpadSchema.nodes.task_item!),
      "Shift-Tab": liftListItem(arkpadSchema.nodes.task_item!),
    }),
  };
}

export { createTaskItem };

// UTILITY EXTENSIONS
function createHistory(): Extension {
  return {
    name: "history",
    addCommands: () => ({
      undo: () => undo,
      redo: () => redo,
    }),
    addKeyboardShortcuts: () => ({
      "Mod-z": undo,
      "Mod-y": redo,
      "Mod-Shift-z": redo,
    }),
    addProseMirrorPlugins: () => [history()],
  };
}

function createPlaceholder(options: { placeholder?: string } = {}): Extension {
  return {
    name: "placeholder",
    addProseMirrorPlugins: () => [
      createPlaceholderPlugin(options.placeholder || "Start writing..."),
    ],
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
  createTaskItem(),
  createListItem(),
  createCodeBlock(),
  createHardBreak(),
  createHorizontalRule(),
  createImage(),
  createBold(),
  createItalic(),
  createUnderline(),
  createStrike(),
  createCode(),
  createLink(),
  createGapCursor(),
  createDropCursor(),
  createPlaceholder({ placeholder: "Start writing..." }),
  createHistory(),
];

export function createDefaultExtensions(): Extension[] {
  return StarterKit;
}
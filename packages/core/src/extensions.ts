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

// HELPER: toggleList
function toggleList(listType: any, itemType: any) {
  return (state: any, dispatch: any) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    if (!range) return false;

    const parentList = range.parent.type === listType;
    if (parentList) {
      return liftListItem(itemType)(state, dispatch);
    }
    return wrapInList(listType)(state, dispatch);
  };
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
      setCode: () => toggleMark(arkpadSchema.marks.code!),
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
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Alt-1": setBlockType(arkpadSchema.nodes.heading!, { level: 1 }),
      "Mod-Alt-2": setBlockType(arkpadSchema.nodes.heading!, { level: 2 }),
      "Mod-Alt-3": setBlockType(arkpadSchema.nodes.heading!, { level: 3 }),
      "Mod-Alt-4": setBlockType(arkpadSchema.nodes.heading!, { level: 4 }),
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
        const isBlockquote = range.parent.type === arkpadSchema.nodes.blockquote;
        if (isBlockquote) return lift(state, dispatch);
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
        const { $from } = state.selection;
        
        // Use the same precise depth-checking as isActive
        let isCodeBlock = false;
        for (let depth = $from.depth; depth >= 0; depth--) {
          if ($from.node(depth).type === arkpadSchema.nodes.codeBlock) {
            isCodeBlock = true;
            break;
          }
        }

        if (isCodeBlock) {
          return setBlockType(arkpadSchema.nodes.paragraph!)(state, dispatch);
        }
        return setBlockType(arkpadSchema.nodes.codeBlock!)(state, dispatch);
      },
      setCodeBlock: () => setBlockType(arkpadSchema.nodes.codeBlock!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Alt-c": setBlockType(arkpadSchema.nodes.codeBlock!),
    }),
    addInputRules: () => [
      textblockTypeInputRule(/^```$/, arkpadSchema.nodes.codeBlock!),
    ],
  };
}

function createHardBreak(): Extension {
  return {
    name: "hardBreak",
    addCommands: () => ({
      setHardBreak: () => (state: any, dispatch: any) => {
        const node = arkpadSchema.nodes.hardBreak!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Enter": (state, dispatch) => {
         const node = arkpadSchema.nodes.hardBreak!.create();
         if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
         return true;
      },
      "Shift-Enter": (state, dispatch) => {
         const node = arkpadSchema.nodes.hardBreak!.create();
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
        const node = arkpadSchema.nodes.horizontalRule!.create();
        if (dispatch) dispatch(state.tr.replaceSelectionWith(node));
        return true;
      },
    }),
    addInputRules: () => [
      wrappingInputRule(/^(?:---|___\s|\*\*\*\s)$/, arkpadSchema.nodes.horizontalRule!),
    ],
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
      toggleBulletList: () => toggleList(arkpadSchema.nodes.bulletList!, arkpadSchema.nodes.listItem!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-8": toggleList(arkpadSchema.nodes.bulletList!, arkpadSchema.nodes.listItem!),
    }),
    addInputRules: () => [
      wrappingInputRule(/^\s*([-+*])\s$/, arkpadSchema.nodes.bulletList!),
    ],
  };
}

function createOrderedList(): Extension {
  return {
    name: "orderedList",
    addCommands: () => ({
      toggleOrderedList: () => toggleList(arkpadSchema.nodes.orderedList!, arkpadSchema.nodes.listItem!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-7": toggleList(arkpadSchema.nodes.orderedList!, arkpadSchema.nodes.listItem!),
    }),
    addInputRules: () => [
      wrappingInputRule(/^\s*(\d+)\.\s$/, arkpadSchema.nodes.orderedList!, (match) => ({ order: +match[1]! })),
    ],
  };
}

function createListItem(): Extension {
  return {
    name: "listItem",
    addCommands: () => ({
      sinkListItem: () => sinkListItem(arkpadSchema.nodes.listItem!),
      liftListItem: () => liftListItem(arkpadSchema.nodes.listItem!),
      splitListItem: () => splitListItem(arkpadSchema.nodes.listItem!),
    }),
    addKeyboardShortcuts: () => ({
      Enter: splitListItem(arkpadSchema.nodes.listItem!),
      Tab: sinkListItem(arkpadSchema.nodes.listItem!),
      "Shift-Tab": liftListItem(arkpadSchema.nodes.listItem!),
    }),
  };
}

function createTaskList(): Extension {
  return {
    name: "taskList",
    addCommands: () => ({
      toggleTaskList: () => toggleList(arkpadSchema.nodes.taskList!, arkpadSchema.nodes.taskItem!),
    }),
    addInputRules: () => [
      wrappingInputRule(/^\s*(\[ \])\s$/, arkpadSchema.nodes.taskList!),
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
        if (node && (node.type === arkpadSchema.nodes.taskItem || node.type === arkpadSchema.nodes.taskList)) {
          const newAttrs = { ...node.attrs, checked: !node.attrs.checked };
          const tr = state.tr.setNodeMarkup($from.pos, undefined, newAttrs);
          if (dispatch) dispatch(tr);
          return true;
        }
        return false;
      },
    }),
    addKeyboardShortcuts: () => ({
      Enter: splitListItem(arkpadSchema.nodes.taskItem!),
      Tab: sinkListItem(arkpadSchema.nodes.taskItem!),
      "Shift-Tab": liftListItem(arkpadSchema.nodes.taskItem!),
    }),
  };
}

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
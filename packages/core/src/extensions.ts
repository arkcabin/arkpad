import { type Schema } from "prosemirror-model";
import { EditorState, type Plugin, type Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { toggleMark, setBlockType, wrapIn } from "prosemirror-commands";
import { history, undo, redo } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";

import { arkpadSchema } from "./schema";

type Dispatch = (tr: Transaction) => void;

export type { Dispatch };

export interface Extension {
  name: string;
  type?: string;
  getOptions?: () => Record<string, unknown>;
  addCommands?: () => Record<string, (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean>;
  addKeyboardShortcuts?: () => Record<string, (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean>;
  addInputRules?: () => Plugin[];
  addPasteRules?: () => Plugin[];
  addProseMirrorPlugins?: () => Plugin[];
}

export class ExtensionManager {
  public schema: Schema;
  public extensions: Extension[] = [];
  public commands: Record<string, (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean> = {};
  public keyboardShortcuts: Record<string, (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean> = {};
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
    const commands: Record<string, (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean> = {};
    for (const ext of this.extensions) {
      if (ext.addCommands) {
        Object.assign(commands, ext.addCommands());
      }
    }
    return commands;
  }

  private collectKeyboardShortcuts() {
    const shortcuts: Record<string, (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean> = {};
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

function createBold(): Extension {
  return {
    name: "bold",
    addCommands: () => ({
      toggleBold: (state, dispatch) => toggleMark(arkpadSchema.marks.strong!)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-b": (state, dispatch) => toggleMark(arkpadSchema.marks.strong!)(state, dispatch),
    }),
  };
}

function createItalic(): Extension {
  return {
    name: "italic",
    addCommands: () => ({
      toggleItalic: (state, dispatch) => toggleMark(arkpadSchema.marks.em!)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-i": (state, dispatch) => toggleMark(arkpadSchema.marks.em!)(state, dispatch),
    }),
  };
}

function createStrike(): Extension {
  return {
    name: "strike",
    addCommands: () => ({
      toggleStrike: (state, dispatch) => toggleMark(arkpadSchema.marks.strike!)(state, dispatch),
    }),
  };
}

function createCode(): Extension {
  return {
    name: "code",
    addCommands: () => ({
      toggleCode: (state, dispatch) => toggleMark(arkpadSchema.marks.code!)(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-e": (state, dispatch) => toggleMark(arkpadSchema.marks.code!)(state, dispatch),
    }),
  };
}

function createParagraph(): Extension {
  return {
    name: "paragraph",
    addCommands: () => ({
      setParagraph: (state, dispatch) => setBlockType(arkpadSchema.nodes.paragraph!)(state, dispatch),
    }),
  };
}

function createHeading(): Extension {
  return {
    name: "heading",
    addCommands: () => ({
      toggleHeading: (state, dispatch) => setBlockType(arkpadSchema.nodes.heading!, { level: 1 })(state, dispatch),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Alt-1": (state, dispatch) => setBlockType(arkpadSchema.nodes.heading!, { level: 1 })(state, dispatch),
      "Mod-Alt-2": (state, dispatch) => setBlockType(arkpadSchema.nodes.heading!, { level: 2 })(state, dispatch),
      "Mod-Alt-3": (state, dispatch) => setBlockType(arkpadSchema.nodes.heading!, { level: 3 })(state, dispatch),
    }),
  };
}

function createBlockquote(): Extension {
  return {
    name: "blockquote",
    addCommands: () => ({
      toggleBlockquote: (state, dispatch) => wrapIn(arkpadSchema.nodes.blockquote!)(state, dispatch),
    }),
  };
}

function createCodeBlock(): Extension {
  return {
    name: "codeBlock",
    addCommands: () => ({
      toggleCodeBlock: (state, dispatch) => setBlockType(arkpadSchema.nodes.code_block!)(state, dispatch),
    }),
  };
}

function createHistory(): Extension {
  return {
    name: "history",
    addCommands: () => ({
      undo: (state, dispatch) => undo(state, dispatch),
      redo: (state, dispatch) => redo(state, dispatch),
    }),
    addProseMirrorPlugins: () => [history(), keymap({ "Mod-z": undo, "Mod-y": redo, "Mod-Shift-z": redo })],
  };
}

export function createDefaultExtensions(): Extension[] {
  return [
    createBold(),
    createItalic(),
    createStrike(),
    createCode(),
    createParagraph(),
    createHeading(),
    createBlockquote(),
    createCodeBlock(),
    createHistory(),
  ];
}
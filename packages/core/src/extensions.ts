import { type Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { inputRules } from "prosemirror-inputrules";
import { Extension, Dispatch } from "./extensions-types";

export type { Extension, Dispatch };

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
    this.keyboardShortcuts = this.collectKeyboardShortcuts(this.schema);
    this.inputRules = this.collectInputRules(this.schema);
    this.pasteRules = this.collectPasteRules(this.schema);
    this.proseMirrorPlugins = this.collectProseMirrorPlugins(this.schema);
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

  private collectKeyboardShortcuts(schema: Schema) {
    const shortcuts: Record<string, any> = {};
    for (const ext of this.extensions) {
      if (ext.addKeyboardShortcuts) {
        Object.assign(shortcuts, ext.addKeyboardShortcuts(schema));
      }
    }
    return shortcuts;
  }

  private collectInputRules(schema: Schema): any[] {
    const rules: any[] = [];
    for (const ext of this.extensions) {
      if (ext.addInputRules) {
        rules.push(...ext.addInputRules(schema));
      }
    }
    return rules;
  }

  private collectPasteRules(schema: Schema): Plugin[] {
    const rules: Plugin[] = [];
    for (const ext of this.extensions) {
      if (ext.addPasteRules) {
        rules.push(...ext.addPasteRules(schema));
      }
    }
    return rules;
  }

  private collectProseMirrorPlugins(schema: Schema) {
    const plugins: Plugin[] = [];
    for (const ext of this.extensions) {
      if (ext.addProseMirrorPlugins) {
        plugins.push(...ext.addProseMirrorPlugins(schema));
      }
    }
    return plugins;
  }
}

export * from "./extensions/index";
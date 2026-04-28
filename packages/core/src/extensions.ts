import { type Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { inputRules } from "prosemirror-inputrules";
import { Extension, Dispatch } from "./extensions-types";
import { ArkpadCommandRegistry } from "./types";

export type { Extension, Dispatch };

/**
 * ExtensionManager coordinates all editor extensions, collecting their commands,
 * plugins, keyboard shortcuts, and input rules into a unified ProseMirror state.
 */
export class ExtensionManager {
  public schema: Schema;
  public extensions: Extension[] = [];
  public commands: ArkpadCommandRegistry = {};
  public keyboardShortcuts: Record<string, any> = {};
  public inputRules: any[] = [];
  public pasteRules: Plugin[] = [];
  public proseMirrorPlugins: Plugin[] = [];
  public storage: Record<string, any> = {};

  constructor(schema: Schema, extensions: Extension[] = []) {
    this.schema = schema;
    this.registerExtensions(extensions);
  }

  /**
   * Registers multiple extensions at once and rebuilds the editor configuration.
   */
  registerExtensions(extensions: Extension[]): void {
    for (const extension of extensions) {
      this.registerExtension(extension);
    }
    this.commands = this.collectCommands() as unknown as ArkpadCommandRegistry;
    this.keyboardShortcuts = this.collectKeyboardShortcuts(this.schema);
    this.inputRules = this.collectInputRules(this.schema);
    this.pasteRules = this.collectPasteRules(this.schema);
    this.proseMirrorPlugins = this.collectProseMirrorPlugins(this.schema);
    this.storage = this.collectStorage();
  }

  /**
   * Aggregates storage from all registered extensions.
   */
  private collectStorage(): Record<string, any> {
    const storage: Record<string, any> = {};
    for (const ext of this.extensions) {
      if (ext.addStorage) {
        storage[ext.name] = ext.addStorage();
      }
    }
    return storage;
  }

  /**
   * Registers a single extension.
   */
  registerExtension(extension: Extension): void {
    this.extensions.push(extension);
  }

  /**
   * Finds an extension by its name.
   */
  get(name: string): Extension | undefined {
    return this.extensions.find((ext) => ext.name === name);
  }

  /**
   * Returns all collected ProseMirror plugins, including keyboard shortcuts and input rules.
   */
  getPlugins(): Plugin[] {
    return [
      inputRules({ rules: this.inputRules }),
      keymap(this.keyboardShortcuts),
      keymap(baseKeymap),
      ...this.proseMirrorPlugins,
    ];
  }

  /**
   * Aggregates commands from all registered extensions.
   * If multiple extensions define the same command, they are chained.
   */
  private collectCommands() {
    const commands: Record<string, any> = {};

    for (const ext of this.extensions) {
      if (!ext.addCommands) continue;

      const extCommands = ext.addCommands();
      Object.keys(extCommands).forEach((key) => {
        if (commands[key]) {
          const prevCommand = commands[key];
          const newCommand = extCommands[key];
          commands[key] =
            (...args: any[]) =>
            (state: any, dispatch: any, view: any) => {
              return (
                newCommand(...args)(state, dispatch, view) ||
                prevCommand(...args)(state, dispatch, view)
              );
            };
        } else {
          commands[key] = extCommands[key];
        }
      });
    }

    return commands;
  }

  /**
   * Aggregates keyboard shortcuts from all registered extensions.
   */
  private collectKeyboardShortcuts(schema: Schema) {
    const shortcuts: Record<string, any> = {};

    for (const ext of this.extensions) {
      if (!ext.addKeyboardShortcuts) continue;

      const extShortcuts = ext.addKeyboardShortcuts(schema);
      Object.keys(extShortcuts).forEach((key) => {
        if (shortcuts[key]) {
          const prevCommand = shortcuts[key];
          const newCommand = extShortcuts[key];
          shortcuts[key] = (state: any, dispatch: any, view: any) => {
            return newCommand(state, dispatch, view) || prevCommand(state, dispatch, view);
          };
        } else {
          shortcuts[key] = extShortcuts[key];
        }
      });
    }

    return shortcuts;
  }

  /**
   * Aggregates input rules from all registered extensions.
   */
  private collectInputRules(schema: Schema): any[] {
    const rules: any[] = [];
    for (const ext of this.extensions) {
      if (ext.addInputRules) {
        rules.push(...ext.addInputRules(schema));
      }
    }
    return rules;
  }

  /**
   * Aggregates paste rules from all registered extensions.
   */
  private collectPasteRules(schema: Schema): Plugin[] {
    const rules: Plugin[] = [];
    for (const ext of this.extensions) {
      if (ext.addPasteRules) {
        rules.push(...ext.addPasteRules(schema));
      }
    }
    return rules;
  }

  /**
   * Aggregates additional ProseMirror plugins from all registered extensions.
   */
  private collectProseMirrorPlugins(schema: Schema): Plugin[] {
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

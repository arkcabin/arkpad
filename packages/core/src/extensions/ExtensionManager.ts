import { ArkpadExtension, ArkpadCommandRegistry, ArkpadCommand } from "../types";
import { type Schema } from "prosemirror-model";
import { Plugin, EditorState, Transaction } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { inputRules } from "prosemirror-inputrules";
import { EditorView } from "prosemirror-view";
import { SchemaBuilder } from "../schema-builder";

/**
 * ExtensionManager coordinates all editor extensions, collecting their commands,
 * plugins, keyboard shortcuts, and input rules into a unified ProseMirror state.
 */
export class ExtensionManager {
  public schema: Schema;
  public extensions: ArkpadExtension[] = [];
  public commands: ArkpadCommandRegistry = {};
  public storage: Record<string, any> = {};
  public keyboardShortcuts: Record<string, any> = {};
  public inputRules: any[] = [];
  public pasteRules: Plugin[] = [];
  public proseMirrorPlugins: Plugin[] = [];
  public activeMappings: Record<string, string> = {};
  private isBatching = false;

  constructor(schema: Schema, extensions: ArkpadExtension[] = []) {
    this.schema = schema;
    this.isBatching = true;
    this.registerExtensions(extensions);
    this.isBatching = false;
    this.rebuild();
  }

  /**
   * Registers multiple extensions at once and rebuilds the editor configuration.
   */
  registerExtensions(extensions: ArkpadExtension[]): void {
    const allExtensions: ArkpadExtension[] = [];
    const seenNames = new Set<string>(this.extensions.map((ext) => ext.name));

    const flattenExtensions = (exts: ArkpadExtension[]) => {
      for (const extension of exts) {
        if (!seenNames.has(extension.name)) {
          allExtensions.push(extension);
          seenNames.add(extension.name);
        }

        if (extension.addExtensions) {
          flattenExtensions(extension.addExtensions());
        }
      }
    };

    flattenExtensions(extensions);

    // Sort by priority (Higher first)
    allExtensions.sort((a, b) => (b.priority ?? 100) - (a.priority ?? 100));

    // Performance: Reset and rebuild flat mapping cache
    this.activeMappings = {};

    for (const extension of allExtensions) {
      this.extensions.push(extension);
      // Register active mappings if they exist
      if (extension.activeMapping) {
        Object.assign(this.activeMappings, extension.activeMapping);
      }
    }

    if (!this.isBatching) {
      this.rebuild();
    }
  }

  /**
   * Rebuilds all collected commands, keyboard shortcuts, input rules, and plugins.
   */
  rebuild(): void {
    if (typeof window !== "undefined")
      (window as any).arkpad = {
        status: () => ({
          extensions: this.extensions.map((e) => e.name),
          commands: Object.keys(this.commands),
          marks: Object.keys(this.schema.marks),
        }),
      };
    const builder = new SchemaBuilder(this.extensions);
    this.schema = builder.build();

    this.commands = this.collectCommands() as unknown as ArkpadCommandRegistry;
    this.keyboardShortcuts = this.collectKeyboardShortcuts(this.schema);
    this.inputRules = this.collectInputRules(this.schema);
    this.pasteRules = this.collectPasteRules(this.schema);
    this.proseMirrorPlugins = this.collectProseMirrorPlugins(this.schema);
  }

  /**
   * Registers a single extension and rebuilds the configuration.
   */
  registerExtension(extension: ArkpadExtension): void {
    this.registerExtensions([extension]);
  }

  /**
   * Unregisters an extension by name or ID and rebuilds the configuration.
   */
  unregisterExtension(nameOrId: string): void {
    this.extensions = this.extensions.filter((ext) => ext.name !== nameOrId);
    this.rebuild();
  }

  get(name: string): ArkpadExtension | undefined {
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
  private collectCommands(): Record<string, ArkpadCommand> {
    const commands: Record<string, ArkpadCommand> = {};

    // Standard monorepo practice: specialized extensions override core ones.
    const sortedExtensions = [...this.extensions].reverse();

    for (const ext of sortedExtensions) {
      if (!ext.addCommands) continue;
      const extCommands = ext.addCommands();
      Object.keys(extCommands).forEach((key) => {
        const newCommand = extCommands[key];
        if (!newCommand) return;

        if (commands[key]) {
          const prevCommand = commands[key]!;
          commands[key] =
            (...args: any[]) =>
            (props: {
              state: EditorState;
              dispatch?: (tr: Transaction) => void;
              view?: EditorView;
            }) => {
              const run = (cmd: ArkpadCommand) => {
                if (typeof cmd !== "function") return false;
                const result = (cmd as any)(...args);
                if (typeof result === "function") {
                  return result(props);
                }
                return result;
              };

              // Specialized (newest) command runs first
              return run(newCommand) || run(prevCommand);
            };
        } else {
          commands[key] = newCommand;
        }
      });
    }

    return commands;
  }

  /**
   * Aggregates keyboard shortcuts from all registered extensions.
   */
  private collectKeyboardShortcuts(schema: Schema): Record<string, any> {
    const shortcuts: Record<string, any> = {};

    for (const ext of this.extensions) {
      if (!ext.addKeyboardShortcuts) continue;
      const extShortcuts = ext.addKeyboardShortcuts(schema);
      Object.keys(extShortcuts).forEach((key) => {
        const newCommand = extShortcuts[key];
        if (!newCommand) return;

        if (shortcuts[key]) {
          const prevCommand = shortcuts[key];
          shortcuts[key] = (
            state: EditorState,
            dispatch?: (tr: Transaction) => void,
            view?: EditorView
          ) => {
            return newCommand(state, dispatch, view) || prevCommand(state, dispatch, view);
          };
        } else {
          shortcuts[key] = newCommand;
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

import type { Schema, Node as PMNode } from "prosemirror-model";
import { Plugin, EditorState, Transaction } from "prosemirror-state";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { inputRules } from "prosemirror-inputrules";
import { EditorView } from "prosemirror-view";
import { SchemaBuilder } from "../services/schema/schema-builder";
import { MenuEngine } from "../services/menu/MenuEngine";
import type { GlobalMenuStorage } from "../services/menu/MenuEngine";
import type { ArkpadExtension, ArkpadCommandRegistry, ArkpadCommand, IArkpadEditor } from "../api";

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
  public nodeViews: Record<string, any> = {};
  public activeMappings: Record<string, string> = {};
  public commandToExtension: Map<string, ArkpadExtension> = new Map();
  private isBatching = false;
  public menuEngine?: MenuEngine;
  private editor?: IArkpadEditor;

  constructor(schema: Schema, extensions: ArkpadExtension[] = []) {
    this.schema = schema;
    this.isBatching = true;
    this.registerExtensions(extensions);
    this.isBatching = false;
    this.rebuild();
  }

  /**
   * Initializes the menu engine once the editor is available.
   */
  public initMenuEngine(editor: IArkpadEditor) {
    this.editor = editor;
    this.menuEngine = new MenuEngine(editor);
    this.storage.menuEngine = {
      menus: {},
      locks: [],
      isLocked: false,
    } as GlobalMenuStorage;

    this.extensions.forEach((ext) => {
      if (ext.addMenu) {
        const configs = ext.addMenu();
        if (configs) {
          this.menuEngine!.registerExtensionMenus(ext.name, configs);
        }
      }
    });

    // High-Performance Event Tracking
    this.proseMirrorPlugins.push(
      new Plugin({
        view: (view) => {
          const handleOutsideClick = (event: MouseEvent) => {
            if (view.isDestroyed) return;

            const target = event.target as HTMLElement;
            const isInsideEditor = view.dom.contains(target);
            const isInsideMenu =
              target.closest('[data-arkpad-menu="true"]') ||
              target.closest('[data-arkpad-ignore="true"]');

            if (!isInsideEditor && !isInsideMenu) {
              // If we are clicked outside, we must ensure the editor loses focus
              // so that isFocused() returns false and menus hide.
              if (view.hasFocus()) {
                (view.dom as HTMLElement).blur();
              }

              // Force the menu engine to recalculate immediately with forceHide=true
              // We also emit a UI update to ensure React components re-render
              this.menuEngine?.update(view, undefined, true, true);
              this.editor?.emitUiUpdate();
            }
          };

          window.addEventListener("mousedown", handleOutsideClick, true);

          return {
            update: (view, prevState) => {
              // Only trigger if selection changed WITHOUT a doc change (handled by editor.ts)
              if (!prevState.selection.eq(view.state.selection)) {
                this.menuEngine?.update(view, prevState);
              }
            },
            destroy: () => {
              window.removeEventListener("mousedown", handleOutsideClick, true);
            },
          };
        },
        props: {
          handleDOMEvents: {
            focus: (view) => {
              this.menuEngine?.update(view, undefined, true);
              return false;
            },
            blur: (view) => {
              // Delay update to let document.activeElement update
              setTimeout(() => {
                if (!view.isDestroyed) {
                  this.menuEngine?.update(view, undefined, true);
                }
              }, 10);
              return false;
            },
          },
        },
      })
    );
  }

  /**
   * Cleans up listeners and resources.
   */
  public destroy() {
    // Logic for future resource cleanup
  }

  /**
   * Registers multiple extensions at once and rebuilds the editor configuration.
   */
  registerExtensions(extensions: ArkpadExtension[]): void {
    const allExtensions: ArkpadExtension[] = [];
    const seenNames = new Set<string>(this.extensions.map((ext) => ext.name));

    const flattenExtensions = (exts: any[]) => {
      for (const extension of exts) {
        if (!extension) continue;

        // CRITICAL: Recursively flatten arrays
        if (Array.isArray(extension)) {
          flattenExtensions(extension);
          continue;
        }

        if (typeof extension.name !== "string") {
          console.warn("⚠️ [Arkpad] Skipping invalid extension in manager:", extension);
          continue;
        }

        if (!seenNames.has(extension.name)) {
          allExtensions.push(extension);
          seenNames.add(extension.name);
        }

        if (extension.addExtensions) {
          try {
            const nested = extension.addExtensions();
            if (Array.isArray(nested)) flattenExtensions(nested);
          } catch (e) {
            console.error(`[Arkpad] Failed to load nested extensions in manager:`, e);
          }
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
    this.nodeViews = this.collectNodeViews();
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
      ...this.pasteRules,
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

        // Track which extension provides this command for Governance
        this.commandToExtension.set(key, ext);

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

  /**
   * Aggregates node views from all registered extensions.
   */
  private collectNodeViews(): Record<string, any> {
    const nodeViews: Record<string, any> = {};

    for (const ext of this.extensions) {
      if (!ext.addNodeView) continue;
      const renderer = ext.addNodeView();
      if (!renderer) continue;

      nodeViews[ext.name] = (
        node: PMNode,
        view: EditorView,
        getPos: () => number | undefined,
        decorations: any
      ) => {
        return (renderer as any)({
          editor: (view as any).editor,
          view,
          node,
          getPos,
          decorations,
          extension: ext,
        });
      };
    }

    return nodeViews;
  }
}

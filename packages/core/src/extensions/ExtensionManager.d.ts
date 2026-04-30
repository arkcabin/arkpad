import { ArkpadExtension, ArkpadCommandRegistry } from "../types";
import { type Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
/**
 * ExtensionManager coordinates all editor extensions, collecting their commands,
 * plugins, keyboard shortcuts, and input rules into a unified ProseMirror state.
 */
export declare class ExtensionManager {
    schema: Schema;
    extensions: ArkpadExtension[];
    commands: ArkpadCommandRegistry;
    storage: Record<string, any>;
    keyboardShortcuts: Record<string, any>;
    inputRules: any[];
    pasteRules: Plugin[];
    proseMirrorPlugins: Plugin[];
    constructor(schema: Schema, extensions?: ArkpadExtension[]);
    /**
     * Registers multiple extensions at once and rebuilds the editor configuration.
     */
    registerExtensions(extensions: ArkpadExtension[]): void;
    /**
     * Rebuilds all collected commands, keyboard shortcuts, input rules, and plugins.
     */
    rebuild(): void;
    /**
     * Registers a single extension and rebuilds the configuration.
     */
    registerExtension(extension: ArkpadExtension): void;
    /**
     * Unregisters an extension by name or ID and rebuilds the configuration.
     */
    unregisterExtension(nameOrId: string): void;
    get(name: string): ArkpadExtension | undefined;
    /**
     * Returns all collected ProseMirror plugins, including keyboard shortcuts and input rules.
     */
    getPlugins(): Plugin[];
    /**
     * Aggregates commands from all registered extensions.
     * If multiple extensions define the same command, they are chained.
     */
    private collectCommands;
    /**
     * Aggregates keyboard shortcuts from all registered extensions.
     */
    private collectKeyboardShortcuts;
    /**
     * Aggregates input rules from all registered extensions.
     */
    private collectInputRules;
    /**
     * Aggregates paste rules from all registered extensions.
     */
    private collectPasteRules;
    /**
     * Aggregates additional ProseMirror plugins from all registered extensions.
     */
    private collectProseMirrorPlugins;
}

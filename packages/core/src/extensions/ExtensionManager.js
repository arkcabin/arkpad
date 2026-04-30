import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { inputRules } from "prosemirror-inputrules";
/**
 * ExtensionManager coordinates all editor extensions, collecting their commands,
 * plugins, keyboard shortcuts, and input rules into a unified ProseMirror state.
 */
export class ExtensionManager {
    schema;
    extensions = [];
    commands = {};
    storage = {};
    keyboardShortcuts = {};
    inputRules = [];
    pasteRules = [];
    proseMirrorPlugins = [];
    constructor(schema, extensions = []) {
        this.schema = schema;
        this.registerExtensions(extensions);
    }
    /**
     * Registers multiple extensions at once and rebuilds the editor configuration.
     */
    registerExtensions(extensions) {
        const allExtensions = [];
        const seenNames = new Set();
        // First, add already registered extensions to seenNames
        this.extensions.forEach(ext => seenNames.add(ext.name));
        const flattenExtensions = (exts) => {
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
        for (const extension of allExtensions) {
            this.extensions.push(extension);
        }
        this.rebuild();
    }
    /**
     * Rebuilds all collected commands, keyboard shortcuts, input rules, and plugins.
     */
    rebuild() {
        this.commands = this.collectCommands();
        this.keyboardShortcuts = this.collectKeyboardShortcuts(this.schema);
        this.inputRules = this.collectInputRules(this.schema);
        this.pasteRules = this.collectPasteRules(this.schema);
        this.proseMirrorPlugins = this.collectProseMirrorPlugins(this.schema);
    }
    /**
     * Registers a single extension and rebuilds the configuration.
     */
    registerExtension(extension) {
        if (extension.addExtensions) {
            this.registerExtensions(extension.addExtensions());
        }
        this.extensions.push(extension);
        this.rebuild();
    }
    /**
     * Unregisters an extension by name or ID and rebuilds the configuration.
     */
    unregisterExtension(nameOrId) {
        this.extensions = this.extensions.filter((ext) => ext.id !== nameOrId && ext.name !== nameOrId);
        this.rebuild();
    }
    get(name) {
        return this.extensions.find((ext) => ext.name === name);
    }
    /**
     * Returns all collected ProseMirror plugins, including keyboard shortcuts and input rules.
     */
    getPlugins() {
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
    collectCommands() {
        const commands = {};
        for (const ext of this.extensions) {
            if (!ext.addCommands)
                continue;
            const extCommands = ext.addCommands();
            Object.keys(extCommands).forEach((key) => {
                const newCommand = extCommands[key];
                if (!newCommand)
                    return;
                if (commands[key]) {
                    const prevCommand = commands[key];
                    commands[key] =
                        (...args) => (props) => {
                            const run = (cmd) => {
                                if (typeof cmd !== "function")
                                    return false;
                                const result = cmd(...args);
                                if (typeof result === "function") {
                                    return result(props);
                                }
                                return result;
                            };
                            return run(newCommand) || run(prevCommand);
                        };
                }
                else {
                    commands[key] = newCommand;
                }
            });
        }
        return commands;
    }
    /**
     * Aggregates keyboard shortcuts from all registered extensions.
     */
    collectKeyboardShortcuts(schema) {
        const shortcuts = {};
        for (const ext of this.extensions) {
            if (!ext.addKeyboardShortcuts)
                continue;
            const extShortcuts = ext.addKeyboardShortcuts(schema);
            Object.keys(extShortcuts).forEach((key) => {
                const newCommand = extShortcuts[key];
                if (!newCommand)
                    return;
                if (shortcuts[key]) {
                    const prevCommand = shortcuts[key];
                    shortcuts[key] = (state, dispatch, view) => {
                        return newCommand(state, dispatch, view) || prevCommand(state, dispatch, view);
                    };
                }
                else {
                    shortcuts[key] = newCommand;
                }
            });
        }
        return shortcuts;
    }
    /**
     * Aggregates input rules from all registered extensions.
     */
    collectInputRules(schema) {
        const rules = [];
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
    collectPasteRules(schema) {
        const rules = [];
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
    collectProseMirrorPlugins(schema) {
        const plugins = [];
        for (const ext of this.extensions) {
            if (ext.addProseMirrorPlugins) {
                plugins.push(...ext.addProseMirrorPlugins(schema));
            }
        }
        return plugins;
    }
}

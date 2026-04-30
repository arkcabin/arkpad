/**
 * The Extension class is the base for all Arkpad extensions.
 * It provides a declarative API and support for inheritance via .extend().
 */
export class Extension {
    name;
    id;
    config;
    parent;
    options = {};
    storage = {};
    editor = null;
    utils;
    constructor(config, parent) {
        this.name = config.name;
        this.config = config;
        this.parent = parent;
        // Pre-initialize options from config so they are available before init()
        if (this.config.addOptions) {
            this.options = this.config.addOptions.call(this.createContext());
        }
    }
    /**
     * Static factory to create a new extension.
     */
    static create(config) {
        return new Extension(config);
    }
    /**
     * Configures the extension with custom options.
     */
    configure(options) {
        return this.extend({
            addOptions: () => ({
                ...(this.config.addOptions?.call(this.createContext()) || {}),
                ...options,
            }),
        });
    }
    /**
     * Creates a new extension by extending an existing one.
     */
    extend(config) {
        const newConfig = {
            ...this.config,
            ...config,
        };
        return new Extension(newConfig, this);
    }
    /**
     * Injects the editor instance and initializes the context.
     */
    init(editor) {
        this.editor = editor;
        this.utils = {
            isActive: (name, attrs) => editor.isActive(name, attrs),
            getAttributes: (name) => editor.getAttributes(name),
            runCommand: (name, ...args) => editor.runCommand(name, ...args),
            canRunCommand: (name, ...args) => editor.canRunCommand(name, ...args),
        };
        if (this.config.addOptions && !this.options) {
            this.options = this.config.addOptions.call(this.createContext());
        }
        this.options = { ...this.options, ...editor.options?.[this.name] };
        if (this.config.addStorage) {
            const storage = this.config.addStorage.call(this.createContext());
            if (storage && typeof storage === "object" && !Array.isArray(storage)) {
                // Update existing storage object to preserve references
                Object.keys(this.storage).forEach((key) => delete this.storage[key]);
                Object.assign(this.storage, storage);
            }
            else {
                this.storage = storage;
            }
        }
    }
    /**
     * Creates a context for calling extension methods.
     */
    createContext() {
        const context = {
            editor: this.editor,
            options: this.options,
            storage: this.storage,
            name: this.name,
            utils: this.utils ?? {},
        };
        if (this.parent) {
            context.parent = (methodName, ...args) => {
                const parentMethod = this.parent.config[methodName];
                if (typeof parentMethod === "function") {
                    return parentMethod.call(this.parent.createContext(), ...args);
                }
                return undefined;
            };
        }
        return context;
    }
    addGlobalAttributes() {
        return this.config.addGlobalAttributes?.call(this.createContext()) || [];
    }
    addNodes() {
        return this.config.addNodes?.call(this.createContext()) || {};
    }
    addMarks() {
        return this.config.addMarks?.call(this.createContext()) || {};
    }
    addCommands() {
        return this.config.addCommands?.call(this.createContext()) || {};
    }
    addKeyboardShortcuts(schema) {
        return this.config.addKeyboardShortcuts?.call(this.createContext(), schema) || {};
    }
    addInputRules(schema) {
        return this.config.addInputRules?.call(this.createContext(), schema) || [];
    }
    addPasteRules(schema) {
        return this.config.addPasteRules?.call(this.createContext(), schema) || [];
    }
    addProseMirrorPlugins(schema) {
        return this.config.addProseMirrorPlugins?.call(this.createContext(), schema) || [];
    }
    addExtensions() {
        return this.config.addExtensions?.call(this.createContext()) || [];
    }
    onUpdate(props) {
        this.config.onUpdate?.call(this.createContext(), props);
    }
    onTransaction(props) {
        this.config.onTransaction?.call(this.createContext(), props);
    }
    onInterceptor(props) {
        return this.config.onInterceptor?.call(this.createContext(), props) ?? props.transaction;
    }
}

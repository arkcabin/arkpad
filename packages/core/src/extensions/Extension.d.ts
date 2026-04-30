import { ArkpadExtension, ExtensionConfig, ExtensionContext, ArkpadCommandRegistry, ArkpadEditorAPI } from "../types";
import { type Schema } from "prosemirror-model";
import { Plugin, Transaction } from "prosemirror-state";
/**
 * The Extension class is the base for all Arkpad extensions.
 * It provides a declarative API and support for inheritance via .extend().
 */
export declare class Extension<Options = any, Storage = any> implements ArkpadExtension {
    name: string;
    id?: string;
    config: ExtensionConfig<Options, Storage>;
    parent?: Extension;
    options: Options;
    storage: Storage;
    editor: ArkpadEditorAPI | null;
    utils: Record<string, any>;
    constructor(config: ExtensionConfig<Options, Storage>, parent?: Extension);
    /**
     * Static factory to create a new extension.
     */
    static create<O = any, S = any>(config: ExtensionConfig<O, S>): Extension<O, S>;
    /**
     * Configures the extension with custom options.
     */
    configure(options: Partial<Options>): Extension<Options, Storage>;
    /**
     * Creates a new extension by extending an existing one.
     */
    extend<O = Options, S = Storage>(config: Partial<ExtensionConfig<O, S>>): Extension<O, S>;
    /**
     * Injects the editor instance and initializes the context.
     */
    init(editor: ArkpadEditorAPI): void;
    /**
     * Creates a context for calling extension methods.
     */
    createContext(): ExtensionContext<Options, Storage>;
    addGlobalAttributes(): {
        types: string[];
        attributes: Record<string, {
            default: any;
            parseHTML?: (element: HTMLElement) => any;
            renderHTML?: (attributes: Record<string, any>) => any;
        }>;
    }[];
    addNodes(): Record<string, any>;
    addMarks(): Record<string, any>;
    addCommands(): Partial<ArkpadCommandRegistry>;
    addKeyboardShortcuts(schema: Schema): Record<string, any>;
    addInputRules(schema: Schema): any[];
    addPasteRules(schema: Schema): Plugin[];
    addProseMirrorPlugins(schema: Schema): Plugin[];
    addExtensions(): ArkpadExtension[];
    onUpdate(props: {
        editor: ArkpadEditorAPI;
    }): void;
    onTransaction(props: {
        editor: ArkpadEditorAPI;
        transaction: Transaction;
    }): void;
    onInterceptor(props: {
        editor: ArkpadEditorAPI;
        transaction: Transaction;
    }): Transaction | boolean | null;
}

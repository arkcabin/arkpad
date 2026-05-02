import {
  ArkpadExtension,
  ExtensionConfig,
  ExtensionContext,
  ArkpadCommandRegistry,
  ArkpadEditorAPI,
  InterceptorConfig,
} from "../types";
import { type Schema } from "prosemirror-model";
import { Plugin, Transaction } from "prosemirror-state";

/**
 * The Extension class is the base for all Arkpad extensions.
 * It provides a declarative API and support for inheritance via .extend().
 */
export class Extension<Options = any, Storage = any> implements ArkpadExtension {
  public name: string;
  public id?: string;
  public config: ExtensionConfig<Options, Storage>;
  public parent?: Extension;
  public options: Options = {} as Options;
  public storage: Storage = {} as Storage;
  public priority: number = 100;
  public editor: ArkpadEditorAPI | null = null;
  public utils!: Record<string, any>;
  public activeMapping?: Record<string, string>;

  constructor(config: ExtensionConfig<Options, Storage>, parent?: Extension) {
    this.name = config.name;
    this.config = config;
    this.parent = parent;

    // Initialize activeMapping from config
    if (config.activeMapping) {
      this.activeMapping = config.activeMapping;
    }

    if (config.priority !== undefined) {
      this.priority = config.priority;
    }

    // Pre-initialize options from config so they are available before init()
    if (this.config.addOptions) {
      this.options = this.config.addOptions.call(this.createContext());
    }
  }

  /**
   * Static factory to create a new extension.
   */
  static create<O = any, S = any>(config: ExtensionConfig<O, S>): Extension<O, S> {
    return new Extension<O, S>(config);
  }

  /**
   * Configures the extension with custom options.
   */
  configure(options: Partial<Options>): Extension<Options, Storage> {
    return this.extend({
      addOptions: () => ({
        ...(this.config.addOptions?.call(this.createContext()) || {}),
        ...options,
      }),
    }) as any;
  }

  /**
   * Creates a new extension by extending an existing one.
   */
  extend<O = Options, S = Storage>(config: Partial<ExtensionConfig<O, S>>): Extension<O, S> {
    const newConfig = {
      ...this.config,
      ...config,
    };

    return new Extension<O, S>(newConfig as ExtensionConfig<O, S>, this);
  }

  /**
   * Injects the editor instance and initializes the context.
   */
  init(editor: ArkpadEditorAPI): void {
    this.editor = editor;
    this.utils = {
      isActive: (name: string, attrs?: Record<string, any>) => editor.isActive(name, attrs),
      getAttributes: (name: string) => editor.getAttributes(name),
      runCommand: (name: string, ...args: any[]) => editor.runCommand(name, ...args),
      canRunCommand: (name: string, ...args: any[]) => editor.canRunCommand(name, ...args),
    };

    if (this.config.addOptions && !this.options) {
      this.options = this.config.addOptions.call(this.createContext());
    }

    this.options = { ...this.options, ...(editor as any).options?.[this.name] };

    if (this.config.addStorage) {
      const storage = this.config.addStorage.call(this.createContext());
      if (storage && typeof storage === "object" && !Array.isArray(storage)) {
        // Update existing storage object to preserve references
        Object.keys(this.storage as any).forEach((key) => delete (this.storage as any)[key]);
        Object.assign(this.storage as any, storage);
      } else {
        this.storage = storage;
      }
    }

    this.onInit();
  }

  /**
   * Called when the editor is initialized.
   */
  onInit() {
    this.config.onInit?.call(this.createContext());
  }

  /**
   * Creates a context for calling extension methods.
   */
  public createContext(): ExtensionContext<Options, Storage> {
    const context: ExtensionContext<Options, Storage> = {
      editor: this.editor as any,
      options: this.options,
      storage: this.storage,
      name: this.name,
      utils: this.utils ?? {},
    };

    if (this.parent) {
      context.parent = (methodName: string, ...args: any[]) => {
        const parentMethod = (this.parent!.config as any)[methodName];
        if (typeof parentMethod === "function") {
          return parentMethod.call(this.parent!.createContext(), ...args);
        }
        return undefined;
      };
    }

    return context;
  }

  addGlobalAttributes() {
    return this.config.addGlobalAttributes?.call(this.createContext()) || [];
  }

  addAttributes() {
    return this.config.addAttributes?.call(this.createContext()) || {};
  }

  addNodes() {
    return this.config.addNodes?.call(this.createContext()) || {};
  }

  extendNodeSchema(spec: any, nodeName: string) {
    return this.config.extendNodeSchema?.call(this.createContext(), spec, nodeName) || spec;
  }

  addMarks() {
    return this.config.addMarks?.call(this.createContext()) || {};
  }

  extendMarkSchema(spec: any, markName: string) {
    return this.config.extendMarkSchema?.call(this.createContext(), spec, markName) || spec;
  }


  addCommands(): Partial<ArkpadCommandRegistry> {
    return this.config.addCommands?.call(this.createContext()) || {};
  }

  addKeyboardShortcuts(schema: Schema) {
    return this.config.addKeyboardShortcuts?.call(this.createContext(), schema) || {};
  }

  addInputRules(schema: Schema) {
    return this.config.addInputRules?.call(this.createContext(), schema) || [];
  }

  addPasteRules(schema: Schema): Plugin[] {
    return this.config.addPasteRules?.call(this.createContext(), schema) || [];
  }

  addProseMirrorPlugins(schema: Schema): Plugin[] {
    return this.config.addProseMirrorPlugins?.call(this.createContext(), schema) || [];
  }

  addExtensions(): ArkpadExtension[] {
    return this.config.addExtensions?.call(this.createContext()) || [];
  }

  onUpdate(props: { editor: ArkpadEditorAPI }) {
    this.config.onUpdate?.call(this.createContext(), props);
  }

  onTransaction(props: { editor: ArkpadEditorAPI; transaction: Transaction }) {
    this.config.onTransaction?.call(this.createContext(), props);
  }

  addInterceptors(): InterceptorConfig[] {
    return this.config.addInterceptors?.call(this.createContext()) || [];
  }

  addNodeView() {
    return this.config.addNodeView?.call(this.createContext());
  }

  onInterceptor(props: {
    editor: ArkpadEditorAPI;
    transaction: Transaction;
  }): Transaction | boolean | null {
    return this.config.onInterceptor?.call(this.createContext(), props) ?? props.transaction;
  }

  onDestroy() {
    this.config.onDestroy?.call(this.createContext());
  }

  renderHTML(props: any) {
    return (this.config as any).renderHTML?.call(this.createContext(), props);
  }

  parseHTML() {
    return (this.config as any).parseHTML?.call(this.createContext()) || [];
  }
}

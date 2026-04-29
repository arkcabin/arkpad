import {
  ArkpadExtension,
  ExtensionConfig,
  ExtensionContext,
  ArkpadCommandRegistry,
  ArkpadEditorAPI,
} from "../types";
import { type Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";

/**
 * The Extension class is the base for all Arkpad extensions.
 * It provides a declarative API and support for inheritance via .extend().
 */
export class Extension<Options = any, Storage = any> implements ArkpadExtension {
  public name: string;
  public config: ExtensionConfig<Options, Storage>;
  public parent?: Extension;
  public options: Options = {} as Options;
  public storage: Storage = {} as Storage;
  public editor!: ArkpadEditorAPI;

  constructor(config: ExtensionConfig<Options, Storage>, parent?: Extension) {
    this.name = config.name;
    this.config = config;
    this.parent = parent;
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

    if (this.config.addOptions) {
      this.options = this.config.addOptions.call(this.createContext());
    } else {
      this.options = {} as Options;
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
  }

  /**
   * Creates a context for calling extension methods.
   */
  public createContext(): ExtensionContext<Options, Storage> {
    const context: ExtensionContext<Options, Storage> = {
      editor: this.editor ?? ({} as ArkpadEditorAPI),
      options: this.options,
      storage: this.storage,
      name: this.name,
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

  addNodes() {
    return this.config.addNodes?.call(this.createContext()) || {};
  }

  addMarks() {
    return this.config.addMarks?.call(this.createContext()) || {};
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

  onUpdate(props: { editor: ArkpadEditorAPI }) {
    this.config.onUpdate?.call(this.createContext(), props);
  }
}

import type { Command, EditorState, Plugin, Transaction } from "prosemirror-state";
import type { Node as PMNode } from "prosemirror-model";
import type { EditorView, NodeView } from "prosemirror-view";

export type ArkpadDocJSON = Record<string, unknown>;
export type ArkpadContent = string | ArkpadDocJSON;

export type Dispatch = (tr: Transaction) => void;
export type ArkpadCommandProps = {
  state: EditorState;
  dispatch?: (tr: Transaction) => void;
  view?: EditorView;
  tr: Transaction;
  editor: ArkpadEditorAPI;
  chain: () => ChainedCommands;
  can: () => ChainedCommands;
};

export type ArkpadCommand =
  | Command
  | ((...args: any[]) => Command)
  | ((...args: any[]) => (props: ArkpadCommandProps) => boolean | Promise<boolean>);
export type ArkpadCommandRegistry = Record<string, ArkpadCommand>;

export interface ChainedCommands {
  /**
   * Focuses the editor at the specified position.
   */
  focus(position?: "start" | "end" | number | null): ChainedCommands;

  /**
   * Inserts the given content at the current selection.
   */
  insertContent(content: ArkpadContent, format?: "html" | "markdown" | "json"): ChainedCommands;

  /**
   * Scrolls the current selection into view.
   */
  scrollIntoView(): ChainedCommands;

  /**
   * Sets metadata on the current transaction.
   */
  setMeta(key: any, value: any): ChainedCommands;

  /**
   * Runs a custom command function.
   */
  command(
    fn: (props: {
      state: EditorState;
      tr: Transaction;
      dispatch?: (tr: Transaction) => void;
      view?: EditorView;
    }) => boolean
  ): ChainedCommands;

  /**
   * Executes the collected commands.
   */
  run(): boolean;

  /**
   * Any command registered in the editor can be called here.
   */
  [key: string]: any;
}

export interface ExtensionContext<Options = any, Storage = any> {
  editor: ArkpadEditorAPI;
  options: Options;
  storage: Storage;
  name: string;
  utils: Record<string, any>;
  parent?: (methodName: string, ...args: any[]) => any;
}

export interface ExtensionConfig<Options = any, Storage = any> {
  name: string;
  priority?: number;
  addOptions?: () => Options;
  addStorage?: (this: ExtensionContext<Options, Storage>) => Storage;
  addGlobalAttributes?: (this: ExtensionContext<Options, Storage>) => {
    types: string[];
    attributes: Record<
      string,
      {
        default: any;
        parseHTML?: (element: HTMLElement) => any;
        renderHTML?: (attributes: Record<string, any>) => any;
      }
    >;
  }[];
  addNodes?: (this: ExtensionContext<Options, Storage>) => Record<string, any>;
  addMarks?: (this: ExtensionContext<Options, Storage>) => Record<string, any>;
  addCommands?: (this: ExtensionContext<Options, Storage>) => Partial<ArkpadCommandRegistry>;
  addKeyboardShortcuts?: (
    this: ExtensionContext<Options, Storage>,
    schema: any
  ) => Record<string, any>;
  addInputRules?: (this: ExtensionContext<Options, Storage>, schema: any) => any[];
  addPasteRules?: (this: ExtensionContext<Options, Storage>, schema: any) => Plugin[];
  addProseMirrorPlugins?: (this: ExtensionContext<Options, Storage>, schema: any) => Plugin[];
  addExtensions?: (this: ExtensionContext<Options, Storage>) => ArkpadExtension[];
  onUpdate?: (this: ExtensionContext<Options, Storage>, props: { editor: ArkpadEditorAPI }) => void;
  onTransaction?: (
    this: ExtensionContext<Options, Storage>,
    props: { editor: ArkpadEditorAPI; transaction: Transaction }
  ) => void;
  onInterceptor?: (
    this: ExtensionContext<Options, Storage>,
    props: { editor: ArkpadEditorAPI; transaction: Transaction }
  ) => Transaction | boolean | null;
  [key: string]: any;
}

export interface ArkpadExtension {
  name: string;
  id?: string;
  init?: (editor: ArkpadEditorAPI) => void;
  addNodes?: () => Record<string, any>;
  addMarks?: () => Record<string, any>;
  addGlobalAttributes?: () => any[];
  addCommands?: () => Partial<ArkpadCommandRegistry>;
  addKeyboardShortcuts?: (schema: any) => Record<string, any>;
  addInputRules?: (schema: any) => any[];
  addPasteRules?: (schema: any) => Plugin[];
  addProseMirrorPlugins?: (schema: any) => Plugin[];
  addExtensions?: () => ArkpadExtension[];
  onUpdate?: (props: { editor: ArkpadEditorAPI }) => void;
  onTransaction?: (props: { editor: ArkpadEditorAPI; transaction: Transaction }) => void;
  onInterceptor?: (props: {
    editor: ArkpadEditorAPI;
    transaction: Transaction;
  }) => Transaction | boolean | null;
  storage?: any;
  options?: any;
  extend?: (config: Partial<ExtensionConfig>) => ArkpadExtension;
}

export type NodeViewConstructor =
  | (new (
      node: PMNode,
      view: EditorView,
      getPos: () => number | undefined,
      decorations: any
    ) => NodeView)
  | ((
      node: PMNode,
      view: EditorView,
      getPos: () => number | undefined,
      decorations: any
    ) => NodeView);

export interface SelectionUpdatePayload {
  editor: ArkpadEditorAPI;
  transaction: Transaction;
  coords: { top: number; left: number; bottom: number; right: number };
}

export interface PastePayload {
  editor: ArkpadEditorAPI;
  event: ClipboardEvent;
  slice: any;
}

export type { NodeView };

export interface ArkpadEditorOptions {
  element: HTMLElement;
  content?: ArkpadContent;
  editable?: boolean;
  extensions?: ArkpadExtension[];
  nodeViews?: Record<string, NodeViewConstructor>;
  autofocus?: boolean;
  onCreate?: (editor: ArkpadEditorAPI) => void;
  onUpdate?: (payload: ArkpadUpdatePayload) => void;
  onTransaction?: (props: { editor: ArkpadEditorAPI; transaction: Transaction }) => void;
  onSelectionUpdate?: (props: {
    editor: ArkpadEditorAPI;
    transaction: Transaction;
    coords: { top: number; left: number; bottom: number; right: number } | null;
  }) => void;
  onPaste?: (props: {
    editor: ArkpadEditorAPI;
    event: ClipboardEvent;
    slice: any;
  }) => boolean | void;
  onInterceptor?: (props: {
    editor: ArkpadEditorAPI;
    transaction: Transaction;
  }) => Transaction | boolean | null;
  onDestroy?: (editor: ArkpadEditorAPI) => void;
}

export interface ResolvedArkpadEditorOptions extends Omit<
  ArkpadEditorOptions,
  "content" | "extensions" | "nodeViews"
> {
  content: ArkpadContent;
  extensions: ArkpadExtension[];
  nodeViews: Record<string, NodeViewConstructor>;
  editable: boolean;
  autofocus: boolean;
}

export interface ArkpadUpdatePayload {
  editor: ArkpadEditorAPI;
  state: EditorState;
  html: string;
  json: ArkpadDocJSON;
  text: string;
}

export interface SearchResult {
  from: number;
  to: number;
  text: string;
}

export type ArkpadCommandProxy = Record<string, (...args: any[]) => boolean>;

export interface ArkpadEditorAPI {
  readonly element: HTMLElement;
  readonly commands: ArkpadCommandProxy;
  readonly storage: Record<string, any>;
  getState(): EditorState;
  getView(): EditorView;
  getHTML(): string;
  getJSON(): ArkpadDocJSON;
  getMarkdown(): string;
  getText(): string;
  isActive(name: string, attrs?: Record<string, any>): boolean;
  getAttributes(name: string): Record<string, any> | null;
  runCommand(name: string, ...args: any[]): boolean;
  canRunCommand(name: string, ...args: any[]): boolean;

  /**
   * Returns a command chain to execute multiple commands in a single transaction.
   */
  chain(): ChainedCommands;

  /**
   * Returns a command chain to check if multiple commands can be executed.
   */
  can(): ChainedCommands;

  // Content Management
  setContent(
    content: ArkpadContent,
    format?: "html" | "markdown" | "json",
    emitUpdate?: boolean
  ): void;
  clearContent(emitUpdate?: boolean): void;

  // Selection API
  getSelection(): { from: number; to: number; empty: boolean };
  setSelection(range: { from: number; to: number } | number): void;
  selectAll(): void;

  // Coordinate API
  getCoords(pos?: number): { top: number; left: number; bottom: number; right: number } | null;

  // Search & Replace API
  search(query: string | RegExp): SearchResult[];
  replace(query: string | RegExp, replacement: string): boolean;

  // Editor Control
  focus(pos?: "start" | "end" | number): void;
  blur(): void;
  setEditable(editable: boolean): void;
  isEditable(): boolean;

  // Extension Management
  registerExtension(extension: ArkpadExtension): void;
  registerExtensions(extensions: ArkpadExtension[]): void;
  unregisterExtension(name: string): void;

  // Events
  subscribe(callback: (editor: ArkpadEditorAPI) => void): () => void;
  addInterceptor(interceptor: (props: { editor: ArkpadEditorAPI; transaction: Transaction }) => Transaction | boolean | null): void;
  destroy(): void;
}

import type { Command, EditorState, Plugin, Transaction } from "prosemirror-state";
import type { Node as PMNode } from "prosemirror-model";

export type ArkpadDocJSON = Record<string, unknown>;
export type ArkpadContent = string | ArkpadDocJSON;

export type ArkpadCommand = Command;
export type ArkpadCommandRegistry = Record<string, ArkpadCommand>;

/**
 * Interface for chained commands.
 * Allows calling multiple commands in a single transaction.
 */
export interface ChainedCommands {
  /**
   * Executes the collected commands.
   */
  run(): boolean;

  /**
   * Any command registered in the editor can be called here.
   */
  [key: string]: any;
}

export interface ArkpadExtension {
  name: string;
  plugins?: Plugin[];
  commands?: Partial<ArkpadCommandRegistry>;
  addCommands?: () => Partial<ArkpadCommandRegistry>;
  addKeyboardShortcuts?: (schema: any) => Record<string, any>;
  addInputRules?: (schema: any) => any[];
  addPasteRules?: (schema: any) => Plugin[];
  addProseMirrorPlugins?: (schema: any) => Plugin[];
}

export type NodeViewConstructor =
  | (new (node: PMNode, view: any, getPos: () => number | undefined, decorations: any) => NodeView)
  | ((node: PMNode, view: any, getPos: () => number | undefined, decorations: any) => NodeView);

export interface NodeView {
  dom: globalThis.Node;
  contentDOM?: globalThis.Node;
  update?(node: PMNode, decorations: any): boolean;
  destroy(): void;
  ignoreMutation?(mutation: MutationRecord): boolean;
}

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

export interface ArkpadEditorAPI {
  readonly element: HTMLElement;
  readonly commands: ArkpadCommandRegistry;
  getState(): EditorState;
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

  setContent(
    content: ArkpadContent,
    format?: "html" | "markdown" | "json",
    emitUpdate?: boolean
  ): void;
  clearContent(emitUpdate?: boolean): void;
  focus(): void;
  blur(): void;
  setEditable(editable: boolean): void;
  isEditable(): boolean;
  registerExtension(extension: ArkpadExtension): void;
  registerExtensions(extensions: ArkpadExtension[]): void;
  subscribe(callback: (editor: ArkpadEditorAPI) => void): () => void;
  destroy(): void;
}

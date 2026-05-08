import type { Command, EditorState, Transaction } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type { Schema } from "prosemirror-model";
import type { ArkpadExtension } from "./extensions";

export type Dispatch = (tr: Transaction) => void;
export type EditorSubscriptionScope = "state" | "ui" | "all";
export type CommandManagerMode = "execute" | "probe";

export interface EditorDebugOptions {
  commandLogs?: boolean;
}

export type ArkpadCommandProps = {
  state: EditorState;
  dispatch?: (tr: Transaction) => void;
  view?: EditorView;
  tr: Transaction;
  editor: any;
  chain: () => ChainedCommands;
  can: () => ChainedCommands;
};

export type ArkpadCommand =
  | Command
  | ((...args: any[]) => Command)
  | ((
      ...args: any[]
    ) => (props: ArkpadCommandProps) => boolean | Promise<boolean> | ChainedCommands);

export type ArkpadCommandRegistry = Record<string, ArkpadCommand>;

/**
 * The global registry for all Arkpad commands.
 * Extensions should augment this interface to provide autocompletion.
 */
export interface ArkpadCommands {
  [key: string]: any;
}

export interface ChainedCommands {
  focus(position?: "start" | "end" | number | null): ChainedCommands;
  insertContent(content: any): ChainedCommands;
  scrollIntoView(): ChainedCommands;
  setMeta(key: any, value: any): ChainedCommands;
  updateAttributes(typeOrName: string, attributes: Record<string, any>): ChainedCommands;
  toggleMark(typeOrName: string, attributes?: Record<string, any>): ChainedCommands;
  setMark(typeOrName: string, attributes?: Record<string, any>): ChainedCommands;
  unsetMark(typeOrName: string): ChainedCommands;
  setNodeMarkup(typeOrName: string, attributes?: Record<string, any>): ChainedCommands;
  deleteRange(from: number, to: number): ChainedCommands;
  command(fn: (props: ArkpadCommandProps) => boolean, label?: string): ChainedCommands;
  run(): boolean;
  [key: string]: any;
}

export type ArkpadCommandProxy = {
  [key: string]: (...args: any[]) => boolean;
} & any;

export type ArkpadDocJSON = Record<string, unknown>;
export type ArkpadContent = string | ArkpadDocJSON;

export interface SearchResult {
  from: number;
  to: number;
  text: string;
}

export interface ICommandRegistry {
  commands: ArkpadCommandRegistry;
  chain(state: EditorState, view: EditorView, editor: any): ChainedCommands;
  can(state: EditorState, view: EditorView, editor: any): ChainedCommands;
}

export interface ISelectionService {
  getSelection(): { from: number; to: number; empty: boolean; isCellSelection?: boolean };
  getCoords(pos?: number): { top: number; left: number; bottom: number; right: number } | null;
}

export interface ISchemaService {
  schema: Schema;
  build(extensions: ArkpadExtension[]): Schema;
  rebuild(): void;
}

export interface ArkpadEditorOptions {
  element: HTMLElement;
  content?: ArkpadContent;
  editable?: boolean;
  extensions?: ArkpadExtension[];
  nodeViews?: Record<string, any>;
  debug?: EditorDebugOptions;
  autofocus?: boolean;
  onCreate?: (editor: any) => void;
  onUpdate?: (payload: ArkpadUpdatePayload) => void;
  onTransaction?: (props: { editor: any; transaction: Transaction }) => void;
  onSelectionUpdate?: (props: any) => void;
  onPaste?: (props: any) => boolean | void;
  onInterceptor?: (props: any) => any;
  onDestroy?: (editor: any) => void;
}

export interface ArkpadUpdatePayload {
  editor: any;
  state: EditorState;
}

export interface InterceptorConfig {
  on?: "all" | "docChanged" | "selectionChanged";
  handler: (props: { editor: any; transaction: Transaction }) => any;
}

export type AsyncInterceptor = (props: {
  editor: any;
  transaction: Transaction;
}) => Promise<Transaction | boolean | null>;

export interface ResolvedArkpadEditorOptions extends Omit<
  ArkpadEditorOptions,
  "content" | "extensions" | "nodeViews"
> {
  content: ArkpadContent;
  extensions: ArkpadExtension[];
  nodeViews: Record<string, any>;
  editable: boolean;
  autofocus: boolean;
  debug: EditorDebugOptions;
}

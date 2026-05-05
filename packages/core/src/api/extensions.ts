import type { Transaction, Plugin, EditorState } from "prosemirror-state";
import type { Node as PMNode } from "prosemirror-model";
import type { EditorView, NodeView } from "prosemirror-view";
import type { ArkpadCommandRegistry } from "./services";

export interface AttributeConfig {
  default: any;
  rendered?: boolean;
  parseHTML?: (element: HTMLElement) => any;
  renderHTML?: (attributes: Record<string, any>) => Record<string, any> | null | undefined;
  keepOnSplit?: boolean;
}

export type Attributes = Record<string, AttributeConfig>;

export interface ExtensionContext<Options = any, Storage = any> {
  editor: any;
  options: Options;
  storage: Storage;
  storageService: any;
  events: any;
  name: string;
  utils: Record<string, any>;
  parent?: (methodName: string, ...args: any[]) => any;
}

export interface ExtensionConfig<Options = any, Storage = any> {
  name: string;
  priority?: number;
  addOptions?: () => Options;
  addStorage?: (this: ExtensionContext<Options, Storage>) => Storage;
  addAttributes?: (this: ExtensionContext<Options, Storage>) => Attributes;
  addGlobalAttributes?: (
    this: ExtensionContext<Options, Storage>
  ) => { types: string[]; attributes: Attributes }[];
  addNodes?: (this: ExtensionContext<Options, Storage>) => Record<string, any>;
  extendNodeSchema?: (this: ExtensionContext<Options, Storage>, spec: any, nodeName: string) => any;
  addMarks?: (this: ExtensionContext<Options, Storage>) => Record<string, any>;
  extendMarkSchema?: (this: ExtensionContext<Options, Storage>, spec: any, markName: string) => any;
  addCommands?: (this: ExtensionContext<Options, Storage>) => Partial<ArkpadCommandRegistry>;
  addKeyboardShortcuts?: (
    this: ExtensionContext<Options, Storage>,
    schema: any
  ) => Record<string, any>;
  addInputRules?: (this: ExtensionContext<Options, Storage>, schema: any) => any[];
  addPasteRules?: (this: ExtensionContext<Options, Storage>, schema: any) => Plugin[];
  addProseMirrorPlugins?: (this: ExtensionContext<Options, Storage>, schema: any) => Plugin[];
  addExtensions?: (this: ExtensionContext<Options, Storage>) => any[];
  activeMapping?: Record<string, string>;
  onUpdate?: (this: ExtensionContext<Options, Storage>, props: { editor: any }) => void;
  onTransaction?: (
    this: ExtensionContext<Options, Storage>,
    props: { editor: any; transaction: Transaction }
  ) => void;
  addInterceptors?: (this: ExtensionContext<Options, Storage>) => any[];
  onInterceptor?: (
    this: ExtensionContext<Options, Storage>,
    props: { editor: any; transaction: Transaction }
  ) => Transaction | boolean | null;
  onClick?: (
    this: ExtensionContext<Options, Storage>,
    event: MouseEvent,
    pos: number
  ) => boolean | void;
  onDoubleClick?: (
    this: ExtensionContext<Options, Storage>,
    event: MouseEvent,
    pos: number
  ) => boolean | void;
  onKeyDown?: (this: ExtensionContext<Options, Storage>, event: KeyboardEvent) => boolean | void;
  onDrop?: (
    this: ExtensionContext<Options, Storage>,
    event: DragEvent,
    slice: any,
    moved: boolean
  ) => boolean | void;
  onPaste?: (
    this: ExtensionContext<Options, Storage>,
    event: ClipboardEvent,
    slice: any
  ) => boolean | void;
  onFocus?: (this: ExtensionContext<Options, Storage>) => boolean | void;
  onBlur?: (this: ExtensionContext<Options, Storage>) => boolean | void;
  onSelection?: (
    this: ExtensionContext<Options, Storage>,
    props: { editor: any; transaction: Transaction; node: PMNode | null; pos: number }
  ) => void;
  onInit?: (this: ExtensionContext<Options, Storage>) => void;
  addMenu?: (this: ExtensionContext<Options, Storage>) => any;
  onDestroy?: (this: ExtensionContext<Options, Storage>) => void;
  addNodeView?: (this: ExtensionContext<Options, Storage>) => any;
  [key: string]: any;
}

export interface NodeConfig<Options = any, Storage = any> extends ExtensionConfig<
  Options,
  Storage
> {
  inline?: boolean;
  group?: string;
  content?: string;
  marks?: string;
  atom?: boolean;
  selectable?: boolean;
  draggable?: boolean;
  code?: boolean;
  whitespace?: "pre" | "normal";
  defining?: boolean;
  isolating?: boolean;
  allowGapCursor?: boolean;
  tableRole?: string;
  trailingNode?: boolean;
  isLayout?: boolean;
  isWidget?: boolean;
  isContainer?: boolean;
  allowedContent?: string;
  role?: number;
  allowedRoles?: number;
}

export interface MarkConfig<Options = any, Storage = any> extends ExtensionConfig<
  Options,
  Storage
> {
  inclusive?: boolean;
  excludes?: string;
  group?: string;
  spanning?: boolean;
  code?: boolean;
}

export interface MenuConfig {
  type: "bubble" | "floating";
  shouldShow?: (props: {
    editor: any;
    state: EditorState;
    from: number;
    to: number;
    empty: boolean;
  }) => boolean;
  priority?: number;
}

export interface ArkpadExtension {
  name: string;
  id?: string;
  init?: (editor: any) => void;
  priority?: number;
  addNodes?: () => Record<string, any>;
  extendNodeSchema?: (spec: any, nodeName: string) => any;
  addMarks?: () => Record<string, any>;
  extendMarkSchema?: (spec: any, markName: string) => any;
  addGlobalAttributes?: () => any[];
  addCommands?: () => Partial<ArkpadCommandRegistry>;
  addKeyboardShortcuts?: (schema: any) => Record<string, any>;
  addInputRules?: (schema: any) => any[];
  addPasteRules?: (schema: any) => Plugin[];
  addProseMirrorPlugins?: (schema: any) => Plugin[];
  addExtensions?: () => any[];
  activeMapping?: Record<string, string>;
  onUpdate?: (props: { editor: any }) => void;
  onTransaction?: (props: { editor: any; transaction: Transaction }) => void;
  addInterceptors?: () => any[];
  onInterceptor?: (props: {
    editor: any;
    transaction: Transaction;
  }) => Transaction | boolean | null;
  onClick?: (event: MouseEvent, pos: number) => boolean | void;
  onDoubleClick?: (event: MouseEvent, pos: number) => boolean | void;
  onKeyDown?: (event: KeyboardEvent) => boolean | void;
  onDrop?: (event: DragEvent, slice: any, moved: boolean) => boolean | void;
  onPaste?: (event: ClipboardEvent, slice: any) => boolean | void;
  onFocus?: () => boolean | void;
  onBlur?: () => boolean | void;
  onSelection?: (props: {
    editor: any;
    transaction: Transaction;
    node: PMNode | null;
    pos: number;
  }) => void;
  onInit?: () => void;
  addMenu?: () => MenuConfig | MenuConfig[];
  onDestroy?: () => void;
  storage?: any;
  options?: any;
  addAttributes?: () => Attributes;
  addNodeView?: () => any;
  extend?: (config: Partial<ExtensionConfig<any, any>>) => ArkpadExtension;
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

export type { NodeView };
export type MenuType = "bubble" | "floating";

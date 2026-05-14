// THE STOREFRONT (Public API)

// Contracts
export type { IArkpadEditor } from "./api/editor";
export type {
  ChainedCommands,
  ArkpadCommandProxy,
  ArkpadCommand,
  ArkpadCommandRegistry,
  ArkpadCommandProps,
  SearchResult,
  ArkpadDocJSON,
  ArkpadContent,
  ICommandRegistry,
  ISelectionService,
  ISchemaService,
  ArkpadEditorOptions,
  ResolvedArkpadEditorOptions,
  ArkpadUpdatePayload,
  InterceptorConfig,
  Dispatch,
} from "./api/services";
export type {
  ArkpadExtension,
  ExtensionConfig,
  NodeConfig,
  MarkConfig,
  MenuConfig,
  MenuType,
  AttributeConfig,
  Attributes,
  ExtensionContext,
  NodeViewConstructor,
  NodeView,
} from "./api/extensions";

// SDK
export { Extension } from "./sdk/Extension";
export { Node } from "./sdk/Node";
export { Mark } from "./sdk/Mark";
export * from "./sdk/utils";

// Core
import { ArkpadEditor, createArkpadEditor } from "./core/ArkpadEditor";
export { ArkpadEditor, createArkpadEditor };
export { ArkpadEditor as ArkpadEditorAPI };
export { ExtensionManager } from "./core/ExtensionManager";
export { EventEmitter } from "./core/EventEmitter";
export { Storage } from "./core/Storage";
export { ShortcutRegistry } from "./core/ShortcutRegistry";
export { Governance, NodeRole } from "./core/Governance";

// Services
export { MenuEngine } from "./services/menu/MenuEngine";
export type { GlobalMenuStorage, MenuState } from "./services/menu/MenuEngine";
export { CommandManager } from "./services/commands/CommandManager";

// Extensions
export * from "./extensions";

// Templates
export * from "./services/templates";

// Helper Commands (Previously in src/commands)
export * from "./services/commands";

// Re-export ProseMirror types for extension development (Essential for compatibility)
export {
  Schema,
  Node as PMNode,
  Mark as PMMark,
  Fragment,
  Slice,
  DOMParser as PMDOMParser,
  DOMSerializer as PMDOMSerializer,
} from "prosemirror-model";
export type { NodeSpec, DOMOutputSpec, NodeType, MarkSpec, ContentMatch } from "prosemirror-model";
export {
  EditorState,
  Transaction,
  Selection,
  TextSelection,
  NodeSelection,
  Plugin,
  PluginKey,
} from "prosemirror-state";
export { EditorView, Decoration, DecorationSet } from "prosemirror-view";
export type { NodeView as PMNodeView } from "prosemirror-view";

// UI & Interaction Plugins
export { Placeholder } from "./extensions";
export { dropCursor } from "prosemirror-dropcursor";
export { gapCursor } from "prosemirror-gapcursor";
export { keymap } from "prosemirror-keymap";
export {
  joinBackward,
  selectParentNode,
  joinForward,
  deleteSelection,
  newlineInCode,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
  splitBlockKeepMarks,
  selectNodeBackward,
  selectNodeForward,
  exitCode,
  selectAll,
  setBlockType,
  toggleMark as togglePMMark,
  autoJoin,
  chainCommands,
} from "prosemirror-commands";

// Extension-facing ProseMirror re-exports (so extensions import @arkpad/core, not prosemirror-* directly)
export { history, undo, redo, undoDepth, redoDepth, closeHistory } from "prosemirror-history";
export {
  inputRules,
  InputRule,
  wrappingInputRule,
  textblockTypeInputRule,
  undoInputRule,
} from "prosemirror-inputrules";
export {
  addListNodes,
  wrapInList,
  splitListItem,
  liftListItem,
  sinkListItem,
} from "prosemirror-schema-list";

export * from "prosemirror-tables";

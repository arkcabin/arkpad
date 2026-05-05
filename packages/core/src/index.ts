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

// Services
export { MenuEngine } from "./services/menu/MenuEngine";
export type { GlobalMenuStorage, MenuState } from "./services/menu/MenuEngine";
export { CommandManager } from "./services/commands/CommandManager";

// Extensions
export * from "./extensions";

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
export {
  EditorState,
  Transaction,
  Selection,
  TextSelection,
  NodeSelection,
  Plugin,
} from "prosemirror-state";
export { EditorView } from "prosemirror-view";

// UI & Interaction Plugins
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

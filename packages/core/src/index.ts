export { ArkpadEditor, createArkpadEditor } from "./editor";
export { arkpadSchema } from "./schema";
export { Extension } from "./extensions/Extension";
export { Node } from "./extensions/Node";
export { Mark } from "./extensions/Mark";
export { ExtensionManager } from "./extensions/ExtensionManager";
export * from "./extensions/index";
export { Engine } from "./extensions/index";
export * from "./commands/index";
export type {
  ArkpadCommandRegistry,
  ArkpadCommandProps,
  ArkpadCommandProxy,
  ArkpadCommands,
  ArkpadExtension,
  ArkpadContent,
  ArkpadDocJSON,
  ArkpadEditorAPI,
  ArkpadEditorOptions,
  ArkpadUpdatePayload,
  Dispatch,
  NodeView,
  NodeViewConstructor,
} from "./types";

// Re-export ProseMirror types for extension development
export { 
  Schema, 
  Node as PMNode, 
  Mark as PMMark, 
  Fragment, 
  Slice,
  DOMParser as PMDOMParser,
  DOMSerializer as PMDOMSerializer,
} from "prosemirror-model";
export { EditorState, Transaction, Selection, TextSelection, NodeSelection } from "prosemirror-state";
export { EditorView } from "prosemirror-view";

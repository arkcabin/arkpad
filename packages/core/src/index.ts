export { ArkpadEditor, createArkpadEditor } from "./editor";
export { arkpadSchema } from "./schema";
export { BubbleMenu } from "./bubble-menu";
export { FloatingMenu } from "./floating-menu";
export { ExtensionManager } from "./extensions/ExtensionManager";
export * from "./extensions/index";
export * from "@arkpad/shared";

// Explicitly re-export core types for React package
export type {
  ArkpadEditorAPI,
  ArkpadEditorOptions,
  ArkpadUpdatePayload,
  ArkpadDocJSON,
  NodeViewConstructor,
  ChainedCommands,
  ArkpadExtension as Extension,
} from "@arkpad/shared";


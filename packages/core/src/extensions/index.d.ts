import { ArkpadExtension as Extension } from "../types";
/**
 * Core Essentials - Minimal set of extensions required for the editor to function.
 * Users should typically use @arkpad/starter-kit instead.
 */
export declare const CoreEssentials: Extension[];
/**
 * Returns the core essential extensions.
 */
export declare function createCoreEssentials(): Extension[];
export * from "./base";
export * from "./alignment";
export * from "./unique-id";
export * from "./highlighter-tool";
export * from "./eraser-tool";
export * from "./utils";
export { CharacterCount } from "./character-count";
export { BaseCommands } from "./commands";

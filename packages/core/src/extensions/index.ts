import { createHardBreak } from "./base";
import { createUniqueId } from "./unique-id";
import { BaseCommands } from "./commands";
import { Extension } from "./Extension";
import { ArkpadExtension } from "../types";

/**
 * Engine - The essential skeleton for the editor.
 * Note: The base `arkpadSchema` already provides Document, Paragraph, and Text.
 * This Engine bundle is now a no-op container for utility extensions
 * like History, UniqueId, etc., ensuring a clean separation of concerns.
 */
export const Engine = Extension.create({
  name: "engine",
  addExtensions() {
    return [createHardBreak(), createUniqueId(), BaseCommands];
  },
});

/**
 * Core Essentials - Minimal set of extensions required for the editor to function.
 * Users should typically use @arkpad/starter-kit instead.
 * Note: Document, Paragraph, and Text are provided by the base arkpadSchema.
 */
export const CoreEssentials: ArkpadExtension[] = [
  Engine, // Includes HardBreak, UniqueId, BaseCommands
];

/**
 * Returns the core essential extensions.
 */
export function createCoreEssentials(): ArkpadExtension[] {
  return CoreEssentials;
}

export * from "./base";
export * from "./unique-id";
export * from "./utils";
export { CharacterCount } from "./character-count";
export { BaseCommands } from "./commands";

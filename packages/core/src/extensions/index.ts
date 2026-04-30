import { createDocument, createParagraph, createText, createHardBreak } from "./base";
import { createUniqueId } from "./unique-id";
import { BaseCommands } from "./commands";
import { Extension } from "./Extension";
import { ArkpadExtension } from "../types";

/**
 * Engine - The essential skeleton for the editor.
 * Includes only Document, Paragraph, and Text for maximum speed and flexibility.
 * Uses addExtensions() to bundle the core nodes into a single extension object.
 */
export const Engine = Extension.create({
  name: "engine",
  addExtensions() {
    return [createDocument(), createParagraph(), createText()];
  },
});

/**
 * Core Essentials - Minimal set of extensions required for the editor to function.
 * Users should typically use @arkpad/starter-kit instead.
 */
export const CoreEssentials: ArkpadExtension[] = [
  Engine,
  createHardBreak(),
  createUniqueId(),
  BaseCommands,
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

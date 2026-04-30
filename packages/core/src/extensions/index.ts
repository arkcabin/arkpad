import { createDocument, createParagraph, createText, createHardBreak } from "./base";
import { createMarkdownPaste } from "./markdown";
import { createUniqueId } from "./unique-id";
import { BaseCommands } from "./commands";
import { ArkpadExtension as Extension } from "../types";

/**
 * Core Essentials - Minimal set of extensions required for the editor to function.
 * Users should typically use @arkpad/starter-kit instead.
 */
export const CoreEssentials: Extension[] = [
  createDocument(),
  createParagraph(),
  createText(),
  createHardBreak(),
  createMarkdownPaste(),
  createUniqueId(),
  BaseCommands,
];

/**
 * Returns the core essential extensions.
 */
export function createCoreEssentials(): Extension[] {
  return CoreEssentials;
}

export * from "./base";
export * from "./unique-id";
export * from "./utils";
export { CharacterCount } from "./character-count";
export { BaseCommands } from "./commands";

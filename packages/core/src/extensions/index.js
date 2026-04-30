import { createDocument, createParagraph, createText, createHardBreak, } from "./base";
import { createMarkdownPaste } from "./markdown";
import { createTextAlign } from "./alignment";
import { createUniqueId } from "./unique-id";
import { HighlighterTool } from "./highlighter-tool";
import { EraserTool } from "./eraser-tool";
import { BaseCommands } from "./commands";
/**
 * Core Essentials - Minimal set of extensions required for the editor to function.
 * Users should typically use @arkpad/starter-kit instead.
 */
export const CoreEssentials = [
    createDocument(),
    createParagraph(),
    createText(),
    createHardBreak(),
    createMarkdownPaste(),
    createTextAlign(),
    createUniqueId(),
    HighlighterTool,
    EraserTool,
    BaseCommands,
];
/**
 * Returns the core essential extensions.
 */
export function createCoreEssentials() {
    return CoreEssentials;
}
export * from "./base";
export * from "./alignment";
export * from "./unique-id";
export * from "./highlighter-tool";
export * from "./eraser-tool";
export * from "./utils";
export { CharacterCount } from "./character-count";
export { BaseCommands } from "./commands";

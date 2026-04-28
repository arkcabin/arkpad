import {
  createDocument,
  createParagraph,
  createText,
  createHardBreak,
  createHistory,
  createPlaceholder,
} from "./base";
import {
  createBold,
  createItalic,
  createUnderline,
  createStrike,
  createCode,
  createLink,
  createSuperscript,
  createSubscript,
  createHighlight,
  createClearFormatting,
} from "./marks";
import {
  createHeading,
  createBlockquote,
  createCodeBlock,
  createHorizontalRule,
  createImage,
} from "./nodes";
import {
  createBulletList,
  createOrderedList,
  createTaskList,
  createTaskItem,
  createListItem,
} from "./lists";
import { createMarkdownPaste } from "./markdown";
import { createTextAlign } from "./alignment";
import { ArkpadExtension as Extension } from "../types";

/**
 * Essentials - A bundled collection of the most common and essential editor extensions.
 * Use this as a base for a fully-featured rich text experience.
 */
export const Essentials: Extension[] = [
  createDocument(),
  createParagraph(),
  createText(),
  createHeading(),
  createBlockquote(),
  createBulletList(),
  createOrderedList(),
  createTaskList(),
  createTaskItem(),
  createListItem(),
  createCodeBlock(),
  createHardBreak(),
  createHorizontalRule(),
  createImage(),
  createBold(),
  createItalic(),
  createUnderline(),
  createStrike(),
  createCode(),
  createLink(),
  createSuperscript(),
  createSubscript(),
  createHighlight(),
  createClearFormatting(),
  createPlaceholder({ placeholder: "Start writing..." }),
  createHistory(),
  createMarkdownPaste(),
  createTextAlign(),
];

/**
 * Returns the default set of essential extensions.
 */
export function createEssentials(): Extension[] {
  return Essentials;
}

// Backward compatibility or legacy naming (Optional, but let's stick to Essentials)
export const StarterKit = Essentials;

export * from "./base";
export * from "./marks";
export * from "./nodes";
export * from "./lists";
export * from "./alignment";
export * from "./utils";
export { CharacterCount } from "./character-count";

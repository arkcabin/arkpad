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
import { Extension } from "../extensions-types";

// STARTER KIT - bundles all common extensions
export const StarterKit: Extension[] = [
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
  createPlaceholder({ placeholder: "Start writing..." }),
  createHistory(),
  createMarkdownPaste(),
  createTextAlign(),
];

export function createDefaultExtensions(): Extension[] {
  return StarterKit;
}

export * from "./base";
export * from "./marks";
export * from "./nodes";
export * from "./lists";
export * from "./alignment";
export * from "./utils";

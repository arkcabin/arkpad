import { createHardBreak, createHistory } from "./base";
import { createUniqueId } from "./unique-id";
import { FocusEvents } from "./focusEvents";
import { ClipboardTextSerializer } from "./clipboardTextSerializer";
import { Keymap } from "./keymap";
import { ListKeymap } from "./listKeymap";
import { Dropcursor } from "./dropcursor";
import { Gapcursor } from "./gapcursor";
import { Extension } from "./Extension";
import { ArkpadExtension, ArkpadCommandProps } from "../types";
import {
  toggleMark,
  toggleBlock,
  toggleList,
  setTextAlign,
  insertNode,
  updateAttributes,
} from "../commands";
import { type MarkType, type NodeType } from "prosemirror-model";

/**
 * BaseCommands - Registers global core commands.
 */
export const BaseCommands = Extension.create({
  name: "baseCommands",

  addCommands: () => ({
    toggleMark:
      (type: string | MarkType, attrs?: Record<string, any>) => (props: ArkpadCommandProps) => {
        return toggleMark(type, attrs)(props);
      },
    toggleBlock:
      (type: string | NodeType, attrs?: Record<string, any>) => (props: ArkpadCommandProps) => {
        return toggleBlock(type, attrs)(props);
      },
    toggleList:
      (listType: string | NodeType, itemType: string | NodeType) => (props: ArkpadCommandProps) => {
        return toggleList(listType, itemType)(props);
      },
    setTextAlign: (align: string) => (props: ArkpadCommandProps) => {
      return setTextAlign(align)(props);
    },
    insertNode:
      (type: string | NodeType, attrs?: Record<string, any>) => (props: ArkpadCommandProps) => {
        return insertNode(type, attrs)(props);
      },
    updateAttributes:
      (typeOrName: string, attributes: Record<string, any>) => (props: ArkpadCommandProps) => {
        return updateAttributes(typeOrName, attributes)(props);
      },
    first: (commands: any[]) => (props: ArkpadCommandProps) => {
      for (const command of commands) {
        // If it's a function, call it with props.
        // If that result is another function (higher-order), call it again.
        let result = typeof command === "function" ? command(props) : command;
        if (typeof result === "function") {
          result = result(props);
        }

        if (result === true) return true;
      }
      return false;
    },
  }),
});

/**
 * Engine - The essential skeleton for the editor.
 * Note: The base `arkpadSchema` already provides Document, Paragraph, and Text.
 * This Engine bundle is now a no-op container for utility extensions
 * like History, UniqueId, etc., ensuring a clean separation of concerns.
 */
export const Engine = Extension.create({
  name: "engine",
  addExtensions() {
    return [
      createHardBreak(),
      createUniqueId(),
      createHistory(),
      FocusEvents,
      ClipboardTextSerializer,
      Keymap,
      ListKeymap,
      BaseCommands,
    ];
  },
});

/**
 * Core Essentials - Minimal set of extensions required for the editor to function.
 * Users should typically use @arkpad/starter-kit instead.
 * Note: Document, Paragraph, and Text are provided by the base arkpadSchema.
 */
export const CoreEssentials: ArkpadExtension[] = [
  Engine, // Includes HardBreak, UniqueId, BaseCommands, Focus, Clipboard, Keymaps
  Dropcursor,
  Gapcursor,
];

/**
 * Returns the core essential extensions.
 */
export function createCoreEssentials(): ArkpadExtension[] {
  return CoreEssentials;
}

export * from "./base";
export * from "./unique-id";
export * from "./focusEvents";
export * from "./clipboardTextSerializer";
export * from "./keymap";
export * from "./listKeymap";
export * from "./textDirection";
export * from "./dropcursor";
export * from "./gapcursor";
export * from "./utils";
export { CharacterCount } from "./character-count";

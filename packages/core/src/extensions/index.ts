import { Extension } from "../sdk/Extension";
import { createHardBreak, createHistory } from "./essentials/base";
import { createUniqueId } from "./infrastructure/unique-id";
import { FocusEvents } from "./infrastructure/focusEvents";
import { ClipboardTextSerializer } from "./infrastructure/clipboardTextSerializer";
import { Keymap } from "./infrastructure/keymap";
import { ListKeymap } from "./infrastructure/listKeymap";
import { Dropcursor } from "./ux/dropcursor";
import { Gapcursor } from "./ux/gapcursor";
import { GhostText } from "./ux/GhostText";
import { ArkpadExtension } from "../api/extensions";
import {
  toggleMark,
  toggleBlock,
  toggleList,
  setTextAlign,
  insertNode,
  updateAttributes,
  setNode,
} from "../services/commands";
import { type MarkType, type NodeType } from "prosemirror-model";

/**
 * BaseCommands - Registers global core commands.
 */
export const BaseCommands = Extension.create({
  name: "baseCommands",

  addCommands: () => ({
    toggleMark:
      (type: string | MarkType, attrs?: Record<string, any>) => (props: any) => {
        return toggleMark(type, attrs)(props);
      },
    toggleBlock:
      (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
        return toggleBlock(type, attrs)(props);
      },
    toggleList:
      (listType: string | NodeType) => (props: any) => {
        return toggleList(listType)(props);
      },
    setTextAlign: (align: string) => (props: any) => {
      return setTextAlign(align)(props);
    },
    insertNode:
      (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
        return insertNode(type, attrs)(props);
      },
    updateAttributes:
      (typeOrName: string, attributes: Record<string, any>) => (props: any) => {
        return updateAttributes(typeOrName, attributes)(props);
      },
    setNode:
      (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
        return setNode(type, attrs)(props);
      },
    first: (commands: any[]) => (props: any) => {
      for (const command of commands) {
        let result = typeof command === "function" ? command(props) : command;
        if (typeof result === "function") {
          result = result(props);
        }
        if (result === true) return true;
      }
      return false;
    },
    lockUI: (name: string) => (props: any) => {
      props.editor.extensionManager.menuEngine?.lock(name);
      return true;
    },
    unlockUI: (name: string) => (props: any) => {
      props.editor.extensionManager.menuEngine?.unlock(name);
      return true;
    },
  }),
});

/**
 * Engine - The essential skeleton for the editor.
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
 */
export const CoreEssentials: ArkpadExtension[] = [
  Engine,
  Dropcursor,
  Gapcursor,
  GhostText,
];

/**
 * Returns the core essential extensions.
 */
export function createCoreEssentials(): ArkpadExtension[] {
  return CoreEssentials;
}

export * from "./essentials/base";
export * from "./infrastructure/unique-id";
export * from "./infrastructure/focusEvents";
export * from "./infrastructure/clipboardTextSerializer";
export * from "./infrastructure/keymap";
export * from "./infrastructure/listKeymap";
export * from "./infrastructure/textDirection";
export * from "./ux/dropcursor";
export * from "./ux/gapcursor";
export { CharacterCount } from "./infrastructure/character-count";

import { Extension } from "../sdk/Extension";
import {
  createDocument,
  createParagraph,
  createText,
  createHardBreak,
  createHistory,
} from "./essentials/base";
import { createUniqueId } from "./infrastructure/unique-id";
import { FocusEvents } from "./infrastructure/focusEvents";
import { ClipboardTextSerializer } from "./infrastructure/clipboardTextSerializer";
import { Keymap } from "./infrastructure/keymap";
import { ListKeymap } from "./infrastructure/listKeymap";
import { Dropcursor } from "./ux/dropcursor";
import { Gapcursor } from "./ux/gapcursor";
import { GhostText } from "./ux/GhostText";
import { BaseBlocks } from "./BaseBlocks";

import {
  newlineInCode,
  exitCode,
  selectNodeBackward,
  selectNodeForward,
  deleteSelection,
  joinBackward,
  joinForward,
  selectParentNode,
  selectAll,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
  splitBlockKeepMarks,
} from "prosemirror-commands";
import { undoInputRule } from "prosemirror-inputrules";
import { sinkListItem, liftListItem } from "prosemirror-schema-list";
import { ArkpadExtension } from "../api/extensions";
import {
  toggleMark,
  toggleBlock,
  toggleList,
  setTextAlign,
  insertNode,
  updateAttributes,
  setNode,
  insertContent,
  insertContentAt,
  deleteNode,
  duplicateNode,
} from "../services/commands";
import { type MarkType, type NodeType } from "prosemirror-model";

/**
 * BaseCommands - Registers global core commands.
 */
export const BaseCommands = Extension.create({
  name: "baseCommands",

  addCommands: () => ({
    toggleMark: (type: string | MarkType, attrs?: Record<string, any>) => (props: any) => {
      return toggleMark(type, attrs)(props);
    },
    toggleBlock: (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
      return toggleBlock(type, attrs)(props);
    },
    toggleList: (listType: string | NodeType, itemType: string | NodeType) => (props: any) => {
      return toggleList(listType, itemType)(props);
    },
    setTextAlign: (align: string) => (props: any) => {
      return setTextAlign(align)(props);
    },
    insertNode: (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
      return insertNode(type, attrs)(props);
    },
    updateAttributes: (typeOrName: string, attributes: Record<string, any>) => (props: any) => {
      return updateAttributes(typeOrName, attributes)(props);
    },
    setNode: (type: string | NodeType, attrs?: Record<string, any>) => (props: any) => {
      return setNode(type, attrs)(props);
    },
    insertContent: (content: any) => (props: any) => {
      return insertContent(content)(props);
    },
    insertContentAt: (pos: number, content: any) => (props: any) => {
      return insertContentAt(pos, content)(props);
    },
    deleteNode: (pos?: number) => (props: any) => {
      return deleteNode(pos)(props);
    },
    duplicateNode: (pos?: number) => (props: any) => {
      return duplicateNode(pos)(props);
    },

    // --- Standard ProseMirror Commands ---
    newlineInCode: () => (props: any) => newlineInCode(props.state, props.dispatch, props.view),
    exitCode: () => (props: any) => exitCode(props.state, props.dispatch, props.view),
    selectNodeBackward: () => (props: any) =>
      selectNodeBackward(props.state, props.dispatch, props.view),
    selectNodeForward: () => (props: any) =>
      selectNodeForward(props.state, props.dispatch, props.view),
    deleteSelection: () => (props: any) => deleteSelection(props.state, props.dispatch, props.view),
    joinBackward: () => (props: any) => joinBackward(props.state, props.dispatch, props.view),
    joinForward: () => (props: any) => joinForward(props.state, props.dispatch, props.view),
    selectParentNode: () => (props: any) =>
      selectParentNode(props.state, props.dispatch, props.view),
    selectAll: () => (props: any) => selectAll(props.state, props.dispatch, props.view),
    createParagraphNear: () => (props: any) =>
      createParagraphNear(props.state, props.dispatch, props.view),
    liftEmptyBlock: () => (props: any) => liftEmptyBlock(props.state, props.dispatch, props.view),
    splitBlock: () => (props: any) => splitBlock(props.state, props.dispatch, props.view),
    splitBlockKeepMarks: () => (props: any) =>
      splitBlockKeepMarks(props.state, props.dispatch, props.view),
    undoInputRule: () => (props: any) => undoInputRule(props.state, props.dispatch, props.view),

    // --- List Related Commands ---
    sinkListItem: (type: string | NodeType) => (props: any) => {
      const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
      return sinkListItem(nodeType)(props.state, props.dispatch, props.view);
    },
    liftListItem: (type: string | NodeType) => (props: any) => {
      const nodeType = typeof type === "string" ? props.state.schema.nodes[type] : type;
      return liftListItem(nodeType)(props.state, props.dispatch, props.view);
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

export const Document = createDocument();
export const Paragraph = createParagraph();
export const Text = createText();
export const HardBreak = createHardBreak();
export const History = createHistory();

/**
 * Engine - The essential skeleton for the editor.
 */
export const Engine = Extension.create({
  name: "engine",
  addExtensions() {
    return [
      Document,
      Paragraph,
      Text,
      HardBreak,
      createUniqueId(),
      History,
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
  BaseBlocks,
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
export { Placeholder } from "./ux/Placeholder";

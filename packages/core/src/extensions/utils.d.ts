import { type MarkType, type NodeType } from "prosemirror-model";
import { type EditorState } from "prosemirror-state";
import { InputRule } from "prosemirror-inputrules";
export declare function markInputRule(regexp: RegExp, markType: MarkType, getAttrs?: (match: any) => any): InputRule;
/**
 * Checks if a mark is active in the current selection.
 */
export declare function isMarkActive(state: EditorState, type: MarkType): boolean;
/**
 * Checks if a node is active in the current selection.
 */
export declare function isNodeActive(state: EditorState, type: NodeType, attrs?: Record<string, any>): boolean;
/**
 * Gets attributes of a mark in the current selection.
 */
export declare function getMarkAttributes(state: EditorState, type: MarkType): Record<string, any> | null;
/**
 * Gets attributes of a node in the current selection.
 */
export declare function getNodeAttributes(state: EditorState, type: NodeType): Record<string, any> | null;
/**
 * Smart toggle for marks.
 */
export declare function toggleMark(type: MarkType, attrs?: Record<string, any>): import("prosemirror-state").Command;
/**
 * Smart toggle for block nodes.
 */
export declare function toggleBlock(type: any, attrs?: Record<string, any>): (state: any, dispatch: any) => boolean;
/**
 * Smart toggle for list nodes.
 */
export declare function toggleList(listType: NodeType, itemType: NodeType): (state: EditorState, dispatch: any) => boolean;
/**
 * Command to set text alignment.
 */
export declare function setTextAlign(align: string): (state: EditorState, dispatch: any) => boolean;

import { Node as PMNode, type Schema } from "prosemirror-model";
import type { ArkpadContent, ArkpadEditorOptions, ResolvedArkpadEditorOptions } from "./types";
/**
 * Parses HTML string into a ProseMirror Document.
 */
export declare function parseHtmlContent(content: string, schema: Schema): PMNode;
/**
 * Parses various content formats (HTML, Markdown, JSON) into a ProseMirror Document.
 */
export declare function parseContent(content: ArkpadContent, schema: Schema, format?: "html" | "markdown" | "json"): PMNode;
/**
 * Resolves raw editor options with sensible defaults.
 */
export declare function resolveEditorOptions(options: ArkpadEditorOptions): ResolvedArkpadEditorOptions;

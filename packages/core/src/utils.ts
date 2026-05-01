import { DOMParser as PMDOMParser, Node as PMNode, type Schema } from "prosemirror-model";
import type { ArkpadContent, ArkpadEditorOptions, ResolvedArkpadEditorOptions } from "./types";

/**
 * Parses HTML string into a ProseMirror Document.
 */
export function parseHtmlContent(content: string, schema: Schema): PMNode {
  const parser = PMDOMParser.fromSchema(schema);
  const element = document.createElement("div");
  element.innerHTML = content.trim().length > 0 ? content : "<p></p>";
  return parser.parse(element);
}

/**
 * Parses various content formats (HTML, Markdown, JSON) into a ProseMirror Document.
 */
export function parseContent(
  content: ArkpadContent,
  schema: Schema
): PMNode {
  if (typeof content === "string") {
    // Note: Markdown parsing is no longer hardcoded in core to avoid circular dependencies.
    // If format is markdown, we assume it's already been handled or should be handled by an extension.
    return parseHtmlContent(content, schema);
  }
  return PMNode.fromJSON(schema, content);
}

/**
 * Resolves raw editor options with sensible defaults.
 */
export function resolveEditorOptions(options: ArkpadEditorOptions): ResolvedArkpadEditorOptions {
  return {
    element: options.element,
    content: options.content ?? "<p></p>",
    editable: options.editable ?? true,
    extensions: options.extensions ?? [],
    nodeViews: options.nodeViews ?? {},
    autofocus: options.autofocus ?? false,
    onCreate: options.onCreate,
    onUpdate: options.onUpdate,
    onTransaction: options.onTransaction,
    onSelectionUpdate: options.onSelectionUpdate,
    onPaste: options.onPaste,
    onInterceptor: options.onInterceptor,
    onDestroy: options.onDestroy,
  };
}

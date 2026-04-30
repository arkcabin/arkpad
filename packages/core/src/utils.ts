import { DOMParser as PMDOMParser, Node as PMNode, type Schema } from "prosemirror-model";
import type { ArkpadContent, ArkpadEditorOptions, ResolvedArkpadEditorOptions } from "./types";
import { markdownToHtml } from "@arkpad/extension-markdown";

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
  schema: Schema,
  format?: "html" | "markdown" | "json"
): PMNode {
  if (typeof content === "string") {
    // Auto-detect markdown if not specified but looks like markdown
    if (format === "markdown" || (format === undefined && /^[#*_\-+>=\s]|^\d+\. /m.test(content))) {
      return parseHtmlContent(markdownToHtml(content), schema);
    }
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

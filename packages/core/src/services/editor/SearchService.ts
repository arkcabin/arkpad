import { IArkpadEditor, SearchResult } from "../../api";

/**
 * SearchService provides document-wide search and replace capabilities
 * using strings or regular expressions.
 */
export class SearchService {
  constructor(private editor: IArkpadEditor) {}

  /**
   * Searches the document for the given query.
   */
  public search(query: string | RegExp): SearchResult[] {
    const results: SearchResult[] = [];
    const state = this.editor.getState();
    const regex =
      typeof query === "string"
        ? new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
        : query;

    state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const matches = node.text.matchAll(regex);
        for (const match of matches) {
          if (match.index !== undefined) {
            results.push({
              from: pos + match.index,
              to: pos + match.index + match[0].length,
              text: match[0],
            });
          }
        }
      }
      return true;
    });
    return results;
  }

  /**
   * Replaces all occurrences of the query with the given replacement string.
   */
  public replace(query: string | RegExp, replacement: string): boolean {
    const matches = this.search(query);
    if (matches.length === 0) return false;

    const { tr } = this.editor.getState();
    const schema = this.editor.extensionManager.schema;

    // Sort results by 'from' descending to ensure that positions remain valid during multiple replacements.
    const sortedMatches = [...matches].sort((a, b) => b.from - a.from);

    for (const match of sortedMatches) {
      tr.replaceWith(match.from, match.to, schema.text(replacement));
    }

    this.editor.dispatch(tr);
    return true;
  }
}

import { nanoid } from "nanoid";
import { Plugin, PluginKey, Transaction } from "prosemirror-state";
import { Node as PMNode } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { Extension } from "../../sdk/Extension";

export interface UniqueIdOptions {
  attributeName: string;
  types: string[];
  generateId: () => string;
  idleScanInterval?: number;
}

const pluginKey = new PluginKey("unique-id");

const defaultTypes = ["paragraph", "heading", "blockquote", "code_block", "list_item", "task_item"];

function ensureUniqueId(
  tr: Transaction,
  doc: PMNode,
  pos: number,
  attributeName: string,
  types: string[],
  generateId: () => string,
  seenIds: Set<string>
): boolean {
  if (!doc || pos < 0 || pos >= doc.content.size) {
    return false;
  }

  const node = doc.nodeAt(pos);
  if (!node || !types || !types.includes(node.type.name) || !node.isBlock) {
    return false;
  }

  const id = node.attrs[attributeName];
  if (!id || seenIds.has(id)) {
    tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      [attributeName]: generateId(),
    });
    return true;
  }
  seenIds.add(id);
  return false;
}

function scanDocForIds(
  tr: Transaction,
  doc: PMNode,
  attributeName: string,
  types: string[],
  generateId: () => string
): boolean {
  let modified = false;
  const seenIds = new Set<string>();

  if (!types || !Array.isArray(types)) {
    return false;
  }

  doc.descendants((node: PMNode, pos: number) => {
    if (types.includes(node.type.name) && node.isBlock) {
      const id = node.attrs[attributeName];
      if (!id || seenIds.has(id)) {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          [attributeName]: generateId(),
        });
        modified = true;
      } else {
        seenIds.add(id);
      }
    }
    return true;
  });

  return modified;
}

export const UniqueId = Extension.create({
  name: "uniqueId",

  addOptions() {
    return {
      attributeName: "id",
      types: defaultTypes,
      generateId: () => nanoid(10),
      idleScanInterval: 5000,
    };
  },

  addStorage() {
    return {
      idleScanTimer: null as any,
      lastDocSize: 0,
    };
  },

  addGlobalAttributes() {
    const { attributeName, types } = this.options;

    return [
      {
        types,
        attributes: {
          [attributeName]: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute(attributeName) || element.getAttribute(`data-${attributeName}`),
            renderHTML: (attributes: Record<string, any>) => {
              if (!attributes[attributeName]) return {};
              return {
                [attributeName]: attributes[attributeName],
                [`data-${attributeName}`]: attributes[attributeName],
              };
            },
          },
        },
      },
    ];
  },

  onInit() {
    const { attributeName, types, generateId, idleScanInterval } = this.options;

    // Performance: Only start timer if we are in the browser
    if (typeof window === "undefined") return;

    this.storage.idleScanTimer = setInterval(() => {
      const view = this.editor?.getView() as EditorView;
      if (!view || (view as any).isDestroyed) return;

      const docSize = view.state.doc.content.size;
      if (docSize === this.storage.lastDocSize) return;

      this.storage.lastDocSize = docSize;

      const tr = view.state.tr;
      if (scanDocForIds(tr, view.state.doc, attributeName, types, generateId)) {
        view.dispatch(tr);
      }
    }, idleScanInterval);
  },

  onDestroy() {
    if (this.storage.idleScanTimer) {
      clearInterval(this.storage.idleScanTimer);
      this.storage.idleScanTimer = null;
    }
  },

  addProseMirrorPlugins() {
    const { attributeName, types, generateId } = this.options;

    return [
      new Plugin({
        key: pluginKey,

        appendTransaction(transactions, oldState, newState) {
          if (!transactions.some((tr) => tr.docChanged)) {
            return null;
          }

          const tr = newState.tr;
          let modified = false;
          const seenIds = new Set<string>();

          // Performance: Collect unique ranges to scan to avoid redundant work
          const ranges: { from: number; to: number }[] = [];

          transactions.forEach((transaction) => {
            transaction.steps.forEach((step) => {
              const map = step.getMap();
              map.forEach((_from: number, _to: number, newFrom: number, newTo: number) => {
                // Safety: Clamp to document bounds
                const start = Math.max(0, Math.min(newFrom, newState.doc.content.size));
                const end = Math.max(0, Math.min(newTo, newState.doc.content.size));

                if (start < end) {
                  ranges.push({ from: start, to: end });
                }
              });
            });
          });

          // Merge overlapping ranges for optimal scanning
          const mergedRanges = ranges
            .sort((a, b) => a.from - b.from)
            .reduce(
              (acc, curr) => {
                const last = acc[acc.length - 1];
                if (!last) return [curr];
                if (curr.from <= last.to) {
                  last.to = Math.max(last.to, curr.to);
                } else {
                  acc.push(curr);
                }
                return acc;
              },
              [] as { from: number; to: number }[]
            );

          mergedRanges.forEach((range) => {
            newState.doc.nodesBetween(range.from, range.to, (node: PMNode, pos: number) => {
              if (
                ensureUniqueId(tr, newState.doc, pos, attributeName, types, generateId, seenIds)
              ) {
                modified = true;
              }
              return true;
            });
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});

export function createUniqueId(options?: Partial<UniqueIdOptions>) {
  return UniqueId.extend({
    addOptions() {
      return {
        ...this.parent?.("addOptions"),
        ...options,
      };
    },
  });
}

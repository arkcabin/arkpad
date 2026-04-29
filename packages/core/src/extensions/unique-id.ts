import { nanoid } from "nanoid";
import { Plugin, PluginKey, Transaction } from "prosemirror-state";
import { Node as PMNode } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import { Extension } from "@arkpad/shared";

export interface UniqueIdOptions {
  attributeName: string;
  types: string[];
  generateId: () => string;
  idleScanInterval?: number;
}

const pluginKey = new PluginKey("unique-id");

const defaultTypes = ["paragraph", "heading", "blockquote", "codeBlock", "listItem", "taskItem"];

function ensureUniqueId(
  tr: Transaction,
  doc: PMNode,
  pos: number,
  attributeName: string,
  types: string[],
  generateId: () => string,
  seenIds: Set<string>
): boolean {
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

  addGlobalAttributes() {
    const { attributeName, types } = this.options;

    return [
      {
        types,
        attributes: {
          [attributeName]: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.getAttribute(attributeName) ||
              element.getAttribute(`data-${attributeName}`),
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

  addProseMirrorPlugins() {
    const { attributeName, types, generateId, idleScanInterval } = this.options;

    let idleScanTimer: ReturnType<typeof setInterval> | null = null;
    let pendingIdleScan = false;
    let lastDocSize = 0;

    const scheduleIdleScan = (editorView: EditorView) => {
      if (pendingIdleScan) return;
      pendingIdleScan = true;

      if ("requestIdleCallback" in window) {
        requestIdleCallback(
          () => {
            pendingIdleScan = false;
            if ((editorView as any).isDestroyed) return;
            const tr = editorView.state.tr;
            if (scanDocForIds(tr, editorView.state.doc, attributeName, types, generateId)) {
              editorView.dispatch(tr);
            }
          },
          { timeout: 2000 }
        );
      } else {
        setTimeout(() => {
          pendingIdleScan = false;
          if ((editorView as any).isDestroyed) return;
          const tr = editorView.state.tr;
          if (scanDocForIds(tr, editorView.state.doc, attributeName, types, generateId)) {
            editorView.dispatch(tr);
          }
        }, 100);
      }
    };

    const startIdleScan = (editorView: EditorView) => {
      if (idleScanTimer) clearInterval(idleScanTimer);
      idleScanTimer = setInterval(() => {
        if ((editorView as any).isDestroyed) return;
        if (editorView.state.doc.content.size === lastDocSize) return;
        lastDocSize = editorView.state.doc.content.size;
        scheduleIdleScan(editorView);
      }, idleScanInterval);
    };

    const stopIdleScan = () => {
      if (idleScanTimer) {
        clearInterval(idleScanTimer);
        idleScanTimer = null;
      }
    };

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

          transactions.forEach((transaction) => {
            transaction.steps.forEach((step) => {
              const map = step.getMap();
              map.forEach((_from: number, _to: number, newFrom: number, newTo: number) => {
                newState.doc.nodesBetween(newFrom, newTo, (node: PMNode, pos: number) => {
                  if (
                    ensureUniqueId(
                      tr,
                      newState.doc,
                      pos,
                      attributeName,
                      types,
                      generateId,
                      seenIds
                    )
                  ) {
                    modified = true;
                  }
                  return true;
                });
              });
            });
          });

          if (modified) {
            lastDocSize = newState.doc.content.size;
          }

          return modified ? tr : null;
        },

        view(editorView) {
          requestAnimationFrame(() => {
            if ((editorView as any).isDestroyed) return;

            const tr = editorView.state.tr;
            if (scanDocForIds(tr, editorView.state.doc, attributeName, types, generateId)) {
              editorView.dispatch(tr);
            }

            lastDocSize = editorView.state.doc.content.size;
            startIdleScan(editorView);
          });

          const handleBlur = () => {
            if ((editorView as any).isDestroyed) return;
            const tr = editorView.state.tr;
            if (scanDocForIds(tr, editorView.state.doc, attributeName, types, generateId)) {
              editorView.dispatch(tr);
            }
          };

          const handleDestroy = () => {
            stopIdleScan();
          };

          return {
            update(view: EditorView) {
              if (!view.hasFocus()) {
                handleBlur();
              }
            },
            destroy() {
              handleDestroy();
            },
          };
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

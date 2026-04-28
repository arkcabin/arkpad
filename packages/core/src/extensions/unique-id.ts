import { nanoid } from "nanoid";
import { Plugin, PluginKey } from "prosemirror-state";
import { ArkpadExtension as Extension } from "../types";

export interface UniqueIdOptions {
  attributeName: string;
  types: string[];
  generateId: () => string;
  idleScanInterval?: number;
}

const pluginKey = new PluginKey("unique-id");

const defaultTypes = ["paragraph", "heading", "blockquote", "codeBlock", "listItem", "taskItem"];

function ensureUniqueId(
  tr: import("prosemirror-state").Transaction,
  doc: any,
  pos: number,
  attributeName: string,
  types: string[],
  generateId: () => string,
  seenIds: Set<string>
): boolean {
  const node = doc.nodeAt(pos);
  if (!node || !types.includes(node.type.name) || !node.isBlock) {
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
  tr: import("prosemirror-state").Transaction,
  doc: any,
  attributeName: string,
  types: string[],
  generateId: () => string
): boolean {
  let modified = false;
  const seenIds = new Set<string>();

  doc.descendants((node: any, pos: number) => {
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

export function createUniqueId(options?: Partial<UniqueIdOptions>): Extension {
  const attributeName = options?.attributeName || "id";
  const types = options?.types || defaultTypes;
  const generateId = options?.generateId || (() => nanoid(10));
  const idleScanInterval = options?.idleScanInterval ?? 5000;

  return {
    name: "uniqueId",

    addGlobalAttributes() {
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
      let idleScanTimer: ReturnType<typeof setInterval> | null = null;
      let pendingIdleScan = false;
      let lastDocSize = 0;

      const scheduleIdleScan = (editorView: any) => {
        if (pendingIdleScan) return;
        pendingIdleScan = true;

        if ("requestIdleCallback" in window) {
          requestIdleCallback(
            () => {
              pendingIdleScan = false;
              if (editorView.isDestroyed) return;
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
            if (editorView.isDestroyed) return;
            const tr = editorView.state.tr;
            if (scanDocForIds(tr, editorView.state.doc, attributeName, types, generateId)) {
              editorView.dispatch(tr);
            }
          }, 100);
        }
      };

      const startIdleScan = (editorView: any) => {
        if (idleScanTimer) clearInterval(idleScanTimer);
        idleScanTimer = setInterval(() => {
          if (editorView.isDestroyed) return;
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
                  newState.doc.nodesBetween(newFrom, newTo, (node: any, pos: number) => {
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
              if (editorView.isDestroyed) return;

              const tr = editorView.state.tr;
              if (scanDocForIds(tr, editorView.state.doc, attributeName, types, generateId)) {
                editorView.dispatch(tr);
              }

              lastDocSize = editorView.state.doc.content.size;
              startIdleScan(editorView);
            });

            const handleBlur = () => {
              if (editorView.isDestroyed) return;
              const tr = editorView.state.tr;
              if (scanDocForIds(tr, editorView.state.doc, attributeName, types, generateId)) {
                editorView.dispatch(tr);
              }
            };

            const handleDestroy = () => {
              stopIdleScan();
            };

            return {
              update(view: any) {
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
  };
}

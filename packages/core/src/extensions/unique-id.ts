import { nanoid } from "nanoid";
import { Plugin, PluginKey } from "prosemirror-state";
import { ArkpadExtension as Extension } from "../types";

export interface UniqueIdOptions {
  attributeName: string;
  types: string[];
  generateId: () => string;
}

const pluginKey = new PluginKey("unique-id");

/**
 * UniqueId Extension - Automatically assigns a unique ID to every block node.
 */
export function createUniqueId(options?: Partial<UniqueIdOptions>): Extension {
  const attributeName = options?.attributeName || "id";
  const types = options?.types || ["paragraph", "heading", "blockquote", "codeBlock", "listItem", "taskItem"];
  const generateId = options?.generateId || (() => nanoid(10));

  return {
    name: "uniqueId",

    addGlobalAttributes() {
      return [
        {
          types,
          attributes: {
            [attributeName]: {
              default: null,
              parseHTML: (element) => element.getAttribute(attributeName) || element.getAttribute(`data-${attributeName}`),
              renderHTML: (attributes) => {
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
      return [
        new Plugin({
          key: pluginKey,
          appendTransaction(transactions, oldState, newState) {
            if (!transactions.some(tr => tr.docChanged)) {
              return null;
            }

            const tr = newState.tr;
            let modified = false;
            const seenIds = new Set<string>();

            // Optimization: Only scan ranges that actually changed
            transactions.forEach(transaction => {
              transaction.steps.forEach(step => {
                const map = step.getMap();
                map.forEach((from, to, newFrom, newTo) => {
                  newState.doc.nodesBetween(newFrom, newTo, (node, pos) => {
                    if (node.isBlock && types.includes(node.type.name)) {
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
                });
              });
            });
            
            return modified ? tr : null;
          },

          view(editorView) {
            // On mount, check if we need to assign IDs to the initial content.
            // We wrap this in requestAnimationFrame to ensure the ArkpadEditor instance 
            // has finished initializing and this.view is assigned.
            requestAnimationFrame(() => {
              if (editorView.isDestroyed) return;

              const { state } = editorView;
              const tr = state.tr;
              let modified = false;
              const seenIds = new Set<string>();

              state.doc.descendants((node, pos) => {
                if (node.isBlock && types.includes(node.type.name)) {
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

              if (modified) {
                editorView.dispatch(tr);
              }
            });

            return {};
          },
        }),
      ];
    },
  };
}

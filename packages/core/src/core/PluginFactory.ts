import { Plugin, TextSelection, NodeSelection } from "prosemirror-state";
import { DecorationSet, Decoration } from "prosemirror-view";
import { Governance, HealingAction } from "./Governance";
import { HookManager } from "./HookManager";

export class PluginFactory {
  /**
   * Creates a plugin that intercepts native browser events and routes them to extension hooks.
   */
  static createEventInterceptorPlugin(editor: any, hooks: HookManager) {
    return new Plugin({
      props: {
        handlePaste: (view, event, slice) => {
          if (editor.onPaste) return editor.onPaste({ editor, event, slice }) === true;
          for (const ext of hooks.eventHooks.onPaste) {
            if (ext.onPaste!(event, slice) === true) return true;
          }
          return false;
        },
        handleKeyDown: (view, event) => {
          for (const ext of hooks.eventHooks.onKeyDown) {
            if (ext.onKeyDown!(event) === true) return true;
          }
          return false;
        },
        handleClick: (view, pos, event) => {
          for (const ext of hooks.eventHooks.onClick) {
            if (ext.onClick!(event, pos) === true) return true;
          }
          return false;
        },
        handleDoubleClick: (view, pos, event) => {
          for (const ext of hooks.eventHooks.onDoubleClick) {
            if (ext.onDoubleClick!(event, pos) === true) return true;
          }
          return false;
        },
        handleDrop: (view, event, slice, moved) => {
          for (const ext of hooks.eventHooks.onDrop) {
            if (ext.onDrop!(event, slice, moved) === true) return true;
          }
          return false;
        },
      },
    });
  }

  /**
   * Creates a plugin that renders virtual selections (Ghost selections).
   */
  static createGhostSelectionPlugin(virtualSelections: Map<string, any>) {
    return new Plugin({
      props: {
        decorations: (state) => {
          const decorations: Decoration[] = [];
          virtualSelections.forEach((val) => {
            const { from, to, color, label } = val;
            const size = state.doc.content.size;
            const safeFrom = Math.max(0, Math.min(from, size));
            const safeTo = Math.max(0, Math.min(to, size));

            if (safeFrom === safeTo) {
              const cursor = document.createElement("span");
              cursor.className = "ark-ghost-cursor";
              cursor.style.borderLeft = `2px solid ${color}`;
              cursor.style.height = "1.2em";
              cursor.style.marginLeft = "-1px";
              cursor.style.position = "relative";
              cursor.style.pointerEvents = "none";
              cursor.style.display = "inline-block";
              cursor.style.verticalAlign = "middle";

              if (label) {
                const tag = document.createElement("span");
                tag.className = "ark-ghost-label";
                tag.textContent = label;
                tag.style.position = "absolute";
                tag.style.top = "-1.4em";
                tag.style.left = "0";
                tag.style.fontSize = "10px";
                tag.style.padding = "1px 4px";
                tag.style.borderRadius = "2px";
                tag.style.color = "white";
                tag.style.whiteSpace = "nowrap";
                tag.style.background = color;
                cursor.appendChild(tag);
              }
              decorations.push(Decoration.widget(safeFrom, cursor));
            } else {
              decorations.push(
                Decoration.inline(safeFrom, safeTo, {
                  style: `background-color: ${color}33; border-bottom: 2px solid ${color}`,
                  class: "ark-ghost-selection",
                })
              );
            }
          });
          return DecorationSet.create(state.doc, decorations);
        },
      },
    });
  }

  /**
   * Creates the Structural Healer plugin (The "Sentinel").
   */
  static createStructuralHealerPlugin() {
    return new Plugin({
      appendTransaction: (transactions, oldState, newState) => {
        const isHealing = transactions.some((tr) => tr.getMeta("governance-healing") === true);
        if (isHealing || !transactions.some((tr) => tr.docChanged)) return null;

        const tr = newState.tr;
        const violations: { pos: number; action: HealingAction; typeName: string }[] = [];
        const seenViolations = new Set<string>();

        transactions.forEach((transaction) => {
          transaction.steps.forEach((step) => {
            step.getMap().forEach((_os, _oe, ns, ne) => {
              newState.doc.nodesBetween(
                Math.max(0, ns),
                Math.min(ne, newState.doc.content.size),
                (node, pos, parent) => {
                  if (!parent) return true;
                  const parentRole = Governance.resolveRole(parent);
                  const childRole = Governance.resolveRole(node);
                  const mask = (parent.type.spec as any).allowedRoles;

                  if (!Governance.canAccept(parentRole, childRole, mask)) {
                    const action = Governance.resolveHealingAction(parentRole, childRole);
                    if (action !== HealingAction.NONE) {
                      const key = `${pos}:${action}:${node.type.name}`;
                      if (!seenViolations.has(key)) {
                        seenViolations.add(key);
                        violations.push({ pos, action, typeName: node.type.name });
                      }
                    }
                  }
                  return true;
                }
              );
            });
          });
        });

        if (violations.length === 0) return null;

        let docChanged = false;
        let currentSelection = newState.selection;

        violations
          .sort((a, b) => b.pos - a.pos)
          .forEach(({ pos, action, typeName }) => {
            try {
              const currentDocSize = tr.doc.content.size;
              if (pos < 0 || pos >= currentDocSize) return;

              const currentNode = tr.doc.nodeAt(pos);
              if (!currentNode || currentNode.type.name !== typeName) return;

              const from = tr.doc.resolve(pos);
              const to = tr.doc.resolve(Math.min(pos + currentNode.nodeSize, currentDocSize));
              const stepCountBefore = tr.steps.length;

              if (action === HealingAction.LIFT) {
                const range = from.blockRange(to);
                if (range) tr.lift(range, Math.max(0, range.depth - 1));
              } else if (action === HealingAction.WRAP) {
                const range = from.blockRange(to);
                const paragraph = newState.schema.nodes.paragraph;
                if (range && paragraph) tr.wrap(range, [{ type: paragraph }]);
              } else if (action === HealingAction.DELETE) {
                tr.delete(pos, Math.min(pos + currentNode.nodeSize, tr.doc.content.size));
              }

              if (tr.steps.length > stepCountBefore) {
                docChanged = true;
                currentSelection = currentSelection.map(tr.doc, tr.mapping.slice(stepCountBefore));
              }
            } catch (e) {
              console.error("[Arkpad Governance] Healing failed:", e);
            }
          });

        if (!docChanged) return null;

        const finalSize = tr.doc.content.size;
        const safeFrom = Math.max(0, Math.min(currentSelection.from, finalSize));

        if (currentSelection instanceof NodeSelection) {
          const nodeAtPos = tr.doc.nodeAt(safeFrom);
          if (nodeAtPos && nodeAtPos.type.spec.selectable !== false) {
            tr.setSelection(NodeSelection.create(tr.doc, safeFrom));
          } else {
            tr.setSelection(TextSelection.create(tr.doc, safeFrom));
          }
        } else {
          tr.setSelection(TextSelection.create(tr.doc, safeFrom, Math.max(0, Math.min(currentSelection.to, finalSize))));
        }

        tr.setMeta("governance-healing", true);
        return tr;
      },
    });
  }

  /**
   * Creates a plugin that deactivates painting tools on document change.
   * Includes logic to prevent infinite transaction loops.
   */
  static createPaintingDeactivationPlugin() {
    return new Plugin({
      appendTransaction: (transactions, oldState, newState) => {
        const docChanged = transactions.some((tr) => tr.docChanged);
        const alreadyDeactivated = transactions.some((tr) => tr.getMeta("deactivate-painting-tools"));

        if (docChanged && !alreadyDeactivated) {
          const tr = newState.tr;
          tr.setMeta("deactivate-painting-tools", true);
          tr.setMeta("highlighter", false);
          tr.setMeta("eraser", false);
          return tr;
        }
        return null;
      },
    });
  }
}

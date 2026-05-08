import { Extension } from "@arkpad/core";
import { Plugin, PluginKey, NodeSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const builderUIKey = new PluginKey("builderUI");

export const BuilderUI = Extension.create({
  name: "builderUI",

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: builderUIKey,
        state: {
          init() {
            return { hoveredPos: null };
          },
          apply(tr, value) {
            const hoveredPos = tr.getMeta("builderUI_hover");
            if (hoveredPos !== undefined) {
              return { hoveredPos };
            }
            return value;
          },
        },
        props: {
          handleDOMEvents: {
            mousemove: (view, event) => {
              if (!view.state || !view.state.doc) return false;
              
              const pos = view.posAtDOM(event.target as HTMLElement, 0);
              if (pos !== null && pos >= 0 && pos <= view.state.doc.content.size) {
                try {
                  const $pos = view.state.doc.resolve(pos);
                  for (let d = $pos.depth; d > 0; d--) {
                    const node = $pos.node(d);
                    if (node && node.isBlock && node.type.name !== "doc") {
                      const nodePos = $pos.before(d);
                      const currentState = builderUIKey.getState(view.state);
                      if (currentState && currentState.hoveredPos !== nodePos) {
                        view.dispatch(view.state.tr.setMeta("builderUI_hover", nodePos));
                      }
                      return false;
                    }
                  }
                } catch {
                  // Ignore resolution errors
                }
              }
              
              const currentState = builderUIKey.getState(view.state);
              if (currentState && currentState.hoveredPos !== null) {
                view.dispatch(view.state.tr.setMeta("builderUI_hover", null));
              }
              return false;
            },
            mouseleave: (view) => {
              view.dispatch(view.state.tr.setMeta("builderUI_hover", null));
              return false;
            },
          },
          decorations: (state) => {
            try {
              const pluginState = builderUIKey.getState(state);
              const hoveredPos = pluginState?.hoveredPos ?? null;
              const { selection } = state;
              const decorations: Decoration[] = [];
              
              // Safe check for preview mode
              const isPreview = (editor as any)?.options?.previewMode || false;
              if (isPreview) return DecorationSet.empty;

              // Helper to create the action widget (toolbar)
              const createWidget = (pos: number, node: any) => {
                return Decoration.widget(pos, (view, getPos) => {
                  const widget = document.createElement("div");
                  widget.className = "ark-builder-toolbar";
                  
                  const label = document.createElement("span");
                  label.className = "ark-builder-toolbar-label";
                  label.textContent = node.type.name;
                  widget.appendChild(label);

                  const actions = document.createElement("div");
                  actions.className = "ark-builder-toolbar-actions";

                  const btnDuplicate = document.createElement("button");
                  btnDuplicate.title = "Duplicate";
                  btnDuplicate.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path><rect x="8" y="8" width="13" height="13" rx="2" ry="2"></rect></svg>`;
                  btnDuplicate.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (editor?.commands?.duplicateNode) {
                      editor.commands.duplicateNode(getPos());
                    }
                  };
                  actions.appendChild(btnDuplicate);

                  const btnDelete = document.createElement("button");
                  btnDelete.title = "Delete";
                  btnDelete.className = "delete";
                  btnDelete.innerHTML = `<svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
                  btnDelete.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (editor?.commands?.deleteNode) {
                      editor.commands.deleteNode(getPos());
                    }
                  };
                  actions.appendChild(btnDelete);

                  widget.appendChild(actions);
                  return widget;
                }, { side: -1, stopEvent: () => true });
              };

              // Selected Node Decoration
              const isNodeSelection = selection instanceof NodeSelection;
              if (isNodeSelection) {
                const { node, from } = (selection as NodeSelection);
                if (node && node.isBlock) {
                  decorations.push(Decoration.node(from, from + node.nodeSize, { class: "ark-selected-node" }));
                  decorations.push(createWidget(from, node));
                }
              } else {
                const { $from } = selection;
                for (let d = $from.depth; d > 0; d--) {
                  const node = $from.node(d);
                  if (node && node.isBlock && node.type.name !== "doc") {
                    const start = $from.before(d);
                    decorations.push(Decoration.node(start, $from.after(d), { class: "ark-selected-node" }));
                    decorations.push(createWidget(start, node));
                    break;
                  }
                }
              }

              // Hover Decoration (Only if not already selected)
              if (hoveredPos !== null) {
                try {
                  const node = state.doc.nodeAt(hoveredPos);
                  if (node) {
                    const isAlreadySelected = decorations.some(d => (d as any).from === hoveredPos);
                    if (!isAlreadySelected) {
                      decorations.push(Decoration.node(hoveredPos, hoveredPos + node.nodeSize, { 
                        class: "ark-hovered-node",
                        "data-hover-label": node.type.name 
                      }));
                    }
                  }
                } catch {
                  // Ignore errors during decoration creation
                }
              }

              return DecorationSet.create(state.doc, decorations);
            } catch (err) {
              console.error("[BuilderUI] Decoration crash:", err);
              return DecorationSet.empty;
            }
          },
        },
      }),
    ];
  },
});

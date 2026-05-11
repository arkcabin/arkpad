import { Selection, Plugin, PluginKey, NodeSelection, Extension, Decoration, DecorationSet } from "@arkpad/core";

export const DragDrop = Extension.create({
  name: "dragDrop",

  addCommands() {
    return {
      startDragBlock: (from: number, to: number) => (props: any) => {
        const { view } = props;

        // Set up drag data for internal reordering
        const dragData = JSON.stringify({ from, to });

        // We'll handle this in the DOM handler
        (view.dom as HTMLElement).dataset.draggingBlock = dragData;

        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    let scrollInterval: ReturnType<typeof setInterval> | null = null;
    let currentDragPos = -1;
    let currentDragOverContainerPos = -1;
    const { editor } = this;

    const handleDrop = (view: any, event: any) => {
      const studioBlockData = event.dataTransfer.getData("application/arkpad-block");
      const legacyBlockType = event.dataTransfer.getData("application/x-arkpad-block-type");
      const internalDragData = event.dataTransfer.getData("application/x-arkpad-internal-drag");

      if (!studioBlockData && !legacyBlockType && !internalDragData) {
        return false;
      }

      const { state } = view;

      // Get the drop position
      const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

      if (!pos) {
        return false;
      }

      event.preventDefault();

      let targetPos = pos.pos;
      const data = studioBlockData ? JSON.parse(studioBlockData) : null;

      const isLayout = event.dataTransfer?.types.includes("application/arkpad-layout");
      
      // SURGICAL FIX: If dropping a Section/Layout, force it to the root level (depth 0)
      if (isLayout || data?.type === "section") {
        const $pos = state.doc.resolve(targetPos);
        if ($pos.depth > 0) {
          targetPos = $pos.after(1);
        }
      }

      // Clean up visual state
      const canvas = view.dom.closest(".arkpad-builder-canvas") || view.dom.closest("[data-arkpad-content]");
      canvas?.classList.remove("drag-active");
      view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1 }));

      // Handle internal reordering (drag within editor)
      if (internalDragData) {
        try {
          const dragInfo = JSON.parse(internalDragData);
          const { from, to } = dragInfo;

          // Skip if dropping in the same position
          const $pos = state.doc.resolve(pos.pos);
          const targetPos = $pos.pos;

          if (targetPos >= from && targetPos <= to) {
            return false;
          }

          // Get the node being moved
          const nodeToMove = state.doc.nodeAt(from);
          if (!nodeToMove) return false;

          // Perform the move using replaceStep
          const tr = state.tr;
          const nodeSize = nodeToMove.nodeSize;

          // Delete from original position
          tr.delete(from, from + nodeSize);

          // Insert at new position - we need to recalculate because positions shifted
          const newPos = targetPos < from ? targetPos : targetPos - nodeSize;
          const $newPos = state.doc.resolve(newPos);

          tr.insert($newPos.pos, nodeToMove);

          view.dispatch(tr);
          return true;
        } catch (e) {
          console.error("Failed to handle internal drag", e);
          return false;
        }
      }

      // Build chain for new blocks from library
      let chain = editor.chain();

      // Set text selection at the drop point
      chain = chain.command(({ tr }: { tr: any }) => {
        const $pos = tr.doc.resolve(pos.pos);
        const selection = Selection.near($pos);
        tr.setSelection(selection);
        return true;
      });

      if (studioBlockData) {
        try {
          const data = JSON.parse(studioBlockData);
          // Handle direct insertion at snapped position
          return (view.editor.chain() as any)
            .insertContentAt(targetPos, {
              type: data.type,
              attrs: data.attrs || {},
              content: data.content || undefined,
            })
            .run();
        } catch (e) {
          console.error("Failed to parse studio block data", e);
          return false;
        }
      } else {
        // Legacy handling
        const block = editor.blockRegistry.getBlock(legacyBlockType);
        if (block) {
          const content = block.create();
          chain = chain.insertContent(content);
        } else {
          chain = chain.insertContent({
            type: "paragraph",
            content: [{ type: "text", text: `New ${legacyBlockType}` }],
          });
        }
      }

      return chain.run();
    };

    return [
      new Plugin({
        key: new PluginKey("dragDrop"),
        state: {
          init: () => ({ pos: -1, containerPos: -1 }),
          apply: (tr, value) => {
            const meta = tr.getMeta("dragPosUpdate");
            if (meta) {
              currentDragPos = meta.pos;
              currentDragOverContainerPos = meta.containerPos ?? -1;
              return meta;
            }
            return value;
          },
        },
        destroy() {
          if (scrollInterval) {
            clearInterval(scrollInterval);
          }
        },
        props: {
          decorations: (state) => {
            const decos: Decoration[] = [];
            
            // Gap indicator
            if (currentDragPos !== -1) {
              const gap = Decoration.widget(currentDragPos, () => {
                const el = document.createElement("div");
                el.className = "ark-drop-gap";
                const line = document.createElement("div");
                line.className = "ark-drop-gap-line";
                el.appendChild(line);
                return el;
              });
              decos.push(gap);
            }

            // Container highlight
            if (currentDragOverContainerPos !== -1) {
              const node = state.doc.nodeAt(currentDragOverContainerPos);
              if (node) {
                const highlight = Decoration.node(
                  currentDragOverContainerPos, 
                  currentDragOverContainerPos + node.nodeSize, 
                  { class: "ark-drag-over-container" }
                );
                decos.push(highlight);
              }
            }

            return DecorationSet.create(state.doc, decos);
          },
          handleDOMEvents: {
            dragstart: (view: any, event: any) => {
              const { state } = view;
              const { selection } = state;

              if (selection instanceof NodeSelection) {
                const { from, to } = selection;
                const dragData = JSON.stringify({ from, to });
                event.dataTransfer.setData("application/x-arkpad-internal-drag", dragData);
                event.dataTransfer.effectAllowed = "move";
              }

              return false;
            },
            dragover: (view: any, event: any) => {
              const isStudioBlock = event.dataTransfer?.types.includes("application/arkpad-block");
              const isLegacyBlock = event.dataTransfer?.types.includes(
                "application/x-arkpad-block-type"
              );
              const isInternalDrag = event.dataTransfer?.types.includes(
                "application/x-arkpad-internal-drag"
              );

              if (!isStudioBlock && !isLegacyBlock && !isInternalDrag) return false;
              
              const canvas = view.dom.closest(".arkpad-builder-canvas") || view.dom.closest("[data-arkpad-content]");
              canvas?.classList.add("drag-active");

              // Auto-scroll logic
              const threshold = 100;
              const { clientY } = event;
              const { innerHeight } = window;

              if (clientY < threshold) {
                if (!scrollInterval) {
                  scrollInterval = setInterval(() => {
                    window.scrollBy(0, -10);
                  }, 20);
                }
              } else if (clientY > innerHeight - threshold) {
                if (!scrollInterval) {
                  scrollInterval = setInterval(() => {
                    window.scrollBy(0, 10);
                  }, 20);
                }
              } else {
                if (scrollInterval) {
                  clearInterval(scrollInterval);
                  scrollInterval = null;
                }
              }

              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (pos) {
                let indicatorPos = pos.pos;
                
                // Only snap to root if it's a layout block
                const isLayout = event.dataTransfer?.types.includes("application/arkpad-layout");
                if (isLayout) {
                  const $pos = view.state.doc.resolve(indicatorPos);
                  if ($pos.depth > 0) {
                    indicatorPos = $pos.after(1);
                  }
                }
                
                // Update decoration position
                view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: indicatorPos }));
              }

              event.preventDefault();
              return true;
            },
            dragleave: (view: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              const canvas = view.dom.closest(".arkpad-builder-canvas") || view.dom.closest("[data-arkpad-content]");
              canvas?.classList.remove("drag-active");
              view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1, containerPos: -1 }));
              return false;
            },
            drop: (view: any, event: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              return handleDrop(view, event);
            },
          },
        },
      }),
    ];
  },
});

export default DragDrop;

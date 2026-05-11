import { Selection, Plugin, Extension, Decoration, DecorationSet } from "@arkpad/core";

export const DragDrop = Extension.create({
  name: "dragDrop",

  onDrop(event: DragEvent) {
    if (!event.dataTransfer) {
      return false;
    }

    const studioBlockData = event.dataTransfer.getData("application/arkpad-block");
    const legacyBlockType = event.dataTransfer.getData("application/x-arkpad-block");
    const internalDragData = event.dataTransfer.getData("application/arkpad-internal-drag");

    if (!studioBlockData && !legacyBlockType && !internalDragData) {
      return false;
    }

    const { editor } = this;
    const { view } = editor;
    const { state } = view;

    // Get the drop position
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

    if (!pos) {
      return false;
    }

    event.preventDefault();

    // Clean up visual state
    view.dom.closest(".arkpad-builder-canvas")?.classList.remove("drag-active");
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

        if (targetPos < from) {
          // Calculation logic removed as targetIndex was unused
        } else {
          // Calculation logic removed as targetIndex was unused
        }

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
        // Handle direct insertion from Studio Library
        chain = chain.insertContent({
          type: data.type,
          attrs: data.attrs || {},
          content: data.content || undefined,
        });
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
  },

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

    return [
      new Plugin({
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
            dragover: (view: any, event: any) => {
              const isStudioBlock = event.dataTransfer?.types.includes("application/arkpad-block");
              const isLegacyBlock = event.dataTransfer?.types.includes(
                "application/x-arkpad-block"
              );

              if (!isStudioBlock && !isLegacyBlock) return false;

              view.dom.closest(".arkpad-builder-canvas")?.classList.add("drag-active");

              // Auto-scroll logic
              const threshold = 100;
              const rect = view.dom.getBoundingClientRect();
              const { clientY } = event;

              if (scrollInterval) clearInterval(scrollInterval);
              if (clientY < rect.top + threshold) {
                scrollInterval = setInterval(() => {
                  const scrollParent = view.dom.closest(".overflow-auto");
                  if (scrollParent) scrollParent.scrollBy(0, -15);
                  else window.scrollBy(0, -15);
                }, 20);
              } else if (clientY > rect.bottom - threshold) {
                scrollInterval = setInterval(() => {
                  const scrollParent = view.dom.closest(".overflow-auto");
                  if (scrollParent) scrollParent.scrollBy(0, 15);
                  else window.scrollBy(0, 15);
                }, 20);
              }

              // Gap and Container logic
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (pos) {
                const $pos = view.state.doc.resolve(pos.pos);
                let containerPos = -1;

                // Find nearest layout ancestor
                for (let d = $pos.depth; d > 0; d--) {
                  const node = $pos.node(d);
                  // Check if it's a layout node (section, container, etc)
                  if (node.type.spec.isLayout) {
                    containerPos = $pos.before(d);
                    break;
                  }
                }

                if (pos.pos !== currentDragPos || containerPos !== currentDragOverContainerPos) {
                  view.dispatch(view.state.tr.setMeta("dragPosUpdate", { 
                    pos: pos.pos, 
                    containerPos 
                  }));
                }
              }

              return false;
            },
            dragleave: (view: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              view.dom.closest(".arkpad-builder-canvas")?.classList.remove("drag-active");
              view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1, containerPos: -1 }));
              return false;
            },
            drop: (view: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              view.dom.closest(".arkpad-builder-canvas")?.classList.remove("drag-active");
              view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1, containerPos: -1 }));
              return false;
            },
          },
        },
      }),
    ];
  },
});

export default DragDrop;

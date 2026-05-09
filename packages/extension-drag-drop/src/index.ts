import { Selection, Plugin, Extension, Decoration, DecorationSet } from "@arkpad/core";

export const DragDrop = Extension.create({
  name: "dragDrop",

  onDrop(event: DragEvent) {
    if (!event.dataTransfer) {
      return false;
    }

    const studioBlockData = event.dataTransfer.getData("application/arkpad-block");
    const legacyBlockType = event.dataTransfer.getData("application/x-arkpad-block");

    if (!studioBlockData && !legacyBlockType) {
      return false;
    }

    const { editor } = this;
    const { view } = editor;

    // Get the drop position
    const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });

    if (!pos) {
      return false;
    }

    event.preventDefault();

    // Clean up visual state
    view.dom.closest(".arkpad-builder-canvas")?.classList.remove("drag-active");
    view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1 }));

    // Build chain
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
          content: data.content ? [{ type: "text", text: data.content }] : undefined,
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

  addProseMirrorPlugins() {
    let scrollInterval: ReturnType<typeof setInterval> | null = null;
    let currentDragPos = -1;

    return [
      new Plugin({
        state: {
          init: () => ({ pos: -1 }),
          apply: (tr, value) => {
            const meta = tr.getMeta("dragPosUpdate");
            if (meta) {
              currentDragPos = meta.pos;
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
            if (currentDragPos === -1) return DecorationSet.empty;

            const gap = Decoration.widget(currentDragPos, () => {
              const el = document.createElement("div");
              el.className = "ark-drop-indicator";
              const line = document.createElement("div");
              line.className = "ark-drop-indicator-line";
              el.appendChild(line);
              return el;
            });

            return DecorationSet.create(state.doc, [gap]);
          },
          handleDOMEvents: {
            dragover: (view: any, event: any) => {
              const isStudioBlock = event.dataTransfer?.types.includes("application/arkpad-block");
              const isLegacyBlock = event.dataTransfer?.types.includes("application/x-arkpad-block");

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

              // Gap Indicator logic
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (pos && pos.pos !== currentDragPos) {
                view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: pos.pos }));
              }

              return false;
            },
            dragleave: (view: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              view.dom.closest(".arkpad-builder-canvas")?.classList.remove("drag-active");
              view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1 }));
              return false;
            },
            drop: (view: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              view.dom.closest(".arkpad-builder-canvas")?.classList.remove("drag-active");
              view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1 }));
              return false;
            },
          },
        },
      }),
    ];
  },
});

export default DragDrop;

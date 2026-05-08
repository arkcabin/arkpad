import { Selection, Plugin, Extension, Decoration, DecorationSet } from "@arkpad/core";

export const DragDrop = Extension.create({
  name: "dragDrop",

  onDrop(event: DragEvent) {
    if (!event.dataTransfer) {
      return false;
    }

    const blockType = event.dataTransfer.getData("application/x-arkpad-block");

    if (!blockType) {
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
    view.dom.classList.remove("drag-active");
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

    // Insert the block based on type
    switch (blockType) {
      case "section":
        chain = chain.insertContent({
          type: "section",
          content: [{ type: "paragraph" }],
        });
        break;
      case "columns":
        chain = chain.insertContent({
          type: "paragraph",
          content: [{ type: "text", text: "2 Columns Placeholder" }],
        });
        break;
      case "heading":
        chain = chain.toggleHeading({ level: 2 });
        break;
      case "text":
        chain = chain.setParagraph();
        break;
      case "divider":
        chain = chain.setHorizontalRule();
        break;
      case "quote":
        chain = chain.toggleBlockquote();
        break;
      case "list":
        chain = chain.toggleBulletList();
        break;
      case "code":
        chain = chain.toggleCodeBlock();
        break;
      default:
        chain = chain.insertContent({
          type: "paragraph",
          content: [{ type: "text", text: `New ${blockType}` }],
        });
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
              el.className = "ark-drop-gap";
              // Add internal premium styling
              el.innerHTML = `<div class="ark-drop-gap-line"></div>`;
              return el;
            });

            return DecorationSet.create(state.doc, [gap]);
          },
          handleDOMEvents: {
            dragover: (view: any, event: any) => {
              const blockType = event.dataTransfer?.getData("application/x-arkpad-block");
              if (!blockType) return false;

              view.dom.closest(".arkpad-editor-container")?.classList.add("drag-active");

              // 1. Auto-scroll logic
              const threshold = 100;
              const { top, bottom } = view.dom.getBoundingClientRect();
              const { clientY } = event;

              if (scrollInterval) clearInterval(scrollInterval);
              if (clientY < top + threshold) {
                scrollInterval = setInterval(() => window.scrollBy(0, -15), 20);
              } else if (clientY > bottom - threshold) {
                scrollInterval = setInterval(() => window.scrollBy(0, 15), 20);
              }

              // 2. Gap Indicator logic
              const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
              if (pos && pos.pos !== currentDragPos) {
                view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: pos.pos }));
              }

              return false;
            },
            dragleave: (view: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              view.dom.closest(".arkpad-editor-container")?.classList.remove("drag-active");
              view.dispatch(view.state.tr.setMeta("dragPosUpdate", { pos: -1 }));
              return false;
            },
            drop: (view: any) => {
              if (scrollInterval) clearInterval(scrollInterval);
              view.dom.closest(".arkpad-editor-container")?.classList.remove("drag-active");
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

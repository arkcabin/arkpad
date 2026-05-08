import { Plugin, PluginKey, NodeSelection } from "prosemirror-state";
import { Extension } from "../../sdk/Extension";
import { EditorView } from "prosemirror-view";

const blockHandlePluginKey = new PluginKey("blockHandle");

/**
 * BlockHandle extension adds a floating drag handle to the left of the current block.
 * This makes reordering blocks intuitive and professional.
 */
export const BlockHandle = Extension.create({
  name: "blockHandle",

  addProseMirrorPlugins() {
    let handle: HTMLElement | null = null;
    let view: EditorView | null = null;
    let currentPos: number = -1;

    const createHandle = () => {
      const el = document.createElement("div");
      el.className = "ark-block-handle";
      el.draggable = true;
      el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;

      el.addEventListener("dragstart", () => {
        if (!view || currentPos === -1) return;

        const state = view.state;
        const $pos = state.doc.resolve(currentPos);
        const node = $pos.node(1); // Get top-level block

        if (!node) return;

        // Select the whole node
        const start = $pos.before(1);

        // Set the selection to the block being dragged
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, start)));
      });

      return el;
    };

    return [
      new Plugin({
        key: blockHandlePluginKey,
        view(v) {
          view = v;
          handle = createHandle();
          document.body.appendChild(handle);

          return {
            destroy() {
              if (handle && handle.parentNode) {
                handle.parentNode.removeChild(handle);
              }
            },
          };
        },
        props: {
          handleDOMEvents: {
            mousemove: (v, event) => {
              if (!handle) return false;

              const pos = v.posAtCoords({ left: event.clientX, top: event.clientY });
              if (!pos) return false;

              const $pos = v.state.doc.resolve(pos.pos);
              const node = $pos.node(1);
              if (!node) {
                handle.style.display = "none";
                return false;
              }

              currentPos = pos.pos;
              const start = $pos.before(1);
              const nodeDOM = v.nodeDOM(start) as HTMLElement;

              if (nodeDOM && nodeDOM.getBoundingClientRect) {
                const rect = nodeDOM.getBoundingClientRect();
                const viewRect = v.dom.getBoundingClientRect();

                // Position handle to the left of the block
                handle.style.display = "flex";
                handle.style.top = `${rect.top + window.scrollY}px`;
                handle.style.left = `${viewRect.left - 30 + window.scrollX}px`; // 30px offset to the left
                handle.style.height = `${Math.min(rect.height, 24)}px`; // Cap height for the handle
              }

              return false;
            },
            mouseleave: () => {
              if (handle) handle.style.display = "none";
              return false;
            },
          },
        },
      }),
    ];
  },
});

export default BlockHandle;

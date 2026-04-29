import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { CellSelection } from "prosemirror-tables";
import { Extension } from "./extensions/Extension";
import { ArkpadEditorAPI } from "./types";

export interface BubbleMenuPluginProps {
  id?: string;
  editor: ArkpadEditorAPI;
  element: HTMLElement;
  offset?: number;
  shouldShow?: (props: {
    state: EditorState;
    from: number;
    to: number;
    empty: boolean;
    view: EditorView;
  }) => boolean;
}

export const BubbleMenuPluginKey = new PluginKey("bubbleMenu");

export class BubbleMenuView {
  public id?: string;
  public editor: ArkpadEditorAPI;
  public element: HTMLElement;
  public view: EditorView;
  public shouldShow: BubbleMenuPluginProps["shouldShow"];
  public offset: number;
  private rafId: number | null = null;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: BubbleMenuPluginProps & { view: EditorView }) {
    this.id = props.id;
    this.editor = props.editor;
    this.element = props.element;
    this.view = props.view;
    this.offset = props.offset ?? 12;
    this.shouldShow = props.shouldShow || (({ empty }) => !empty);

    // Initial styles
    this.element.style.position = "fixed";
    this.element.style.zIndex = "1000";
    this.element.style.pointerEvents = "auto";
    this.element.style.transition = "opacity 0.2s, transform 0.2s cubic-bezier(0.2, 0, 0, 1)";
    this.element.style.top = "0";
    this.element.style.left = "0";
    this.element.style.opacity = "0";
    this.element.style.visibility = "hidden";
    this.element.style.display = "flex"; // Keep it flex to avoid layout shifts on show
    this.element.style.setProperty("--sb-x", "0px");
    this.element.style.setProperty("--sb-y", "0px");
    this.element.style.transform = `translate3d(var(--sb-x), var(--sb-y), 0)`;

    // Attach Scroll Listener for "Rock-Solid" anchoring
    this.handleScroll = this.handleScroll.bind(this);

    setTimeout(() => {
      if (this.view && !this.view.isDestroyed) {
        this.update(this.view);
      }
    }, 0);
  }

  handleScroll() {
    this.updatePosition();
  }

  update(view: EditorView) {
    if (!view || view.isDestroyed) return;

    const { state } = view;
    const { selection } = state;
    const { from, to, empty } = selection;

    const shouldShow = this.shouldShow ? this.shouldShow({ state, from, to, empty, view }) : !empty;

    if (shouldShow) {
      this.show();
    } else {
      this.hide();
    }
  }

  show() {
    if (!this.element) return;
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    // Attach Scroll Listener only when visible
    window.addEventListener("scroll", this.handleScroll, true);

    // Use visibility/opacity instead of display: none to avoid reflows
    this.element.style.visibility = "visible";
    this.element.style.opacity = "1";
    this.updatePosition();
  }

  hide() {
    if (!this.element) return;

    // Remove scroll listener when hidden
    window.removeEventListener("scroll", this.handleScroll, true);

    this.element.style.opacity = "0";
    this.hideTimeout = setTimeout(() => {
      if (this.element.style.opacity === "0") {
        this.element.style.visibility = "hidden";
      }
      this.hideTimeout = null;
    }, 200);
  }

  updatePosition() {
    if (
      !this.view ||
      this.view.isDestroyed ||
      !this.element ||
      this.element.style.visibility === "hidden"
    )
      return;

    if (this.rafId) cancelAnimationFrame(this.rafId);

    this.rafId = requestAnimationFrame(() => {
      if (this.view.isDestroyed || !this.element) return;

      const { selection } = this.view.state;

      try {
        let centerX = 0;
        let topY = 0;
        let bottomY = 0;

        // Smart Bounding Box Logic: Handle Tables and Multi-cell selection
        if (selection instanceof CellSelection) {
          let minTop = Infinity;
          let maxBottom = -Infinity;
          let minLeft = Infinity;
          let maxRight = -Infinity;

          selection.forEachCell((node, pos) => {
            const dom = this.view.nodeDOM(pos) as HTMLElement;
            if (dom) {
              const rect = dom.getBoundingClientRect();
              minTop = Math.min(minTop, rect.top);
              maxBottom = Math.max(maxBottom, rect.bottom);
              minLeft = Math.min(minLeft, rect.left);
              maxRight = Math.max(maxRight, rect.right);
            }
          });

          centerX = (minLeft + maxRight) / 2;
          topY = minTop;
          bottomY = maxBottom;
        } else {
          // Standard selection logic
          const start = this.view.coordsAtPos(selection.from);
          const end = this.view.coordsAtPos(selection.to);
          centerX = (start.left + end.left) / 2;
          topY = start.top;
          bottomY = end.bottom;
        }

        const menuHeight = this.element.offsetHeight || 40;
        const menuWidth = this.element.offsetWidth || 200;

        let finalX = centerX - menuWidth / 2;
        let finalY = topY - menuHeight - this.offset;

        // Collision Detection
        if (finalX < 10) finalX = 10;
        if (finalX + menuWidth > window.innerWidth - 10) {
          finalX = window.innerWidth - menuWidth - 10;
        }

        if (finalY < 10) {
          finalY = bottomY + this.offset;
        }

        this.element.style.setProperty("--sb-x", `${finalX}px`);
        this.element.style.setProperty("--sb-y", `${finalY}px`);
      } catch {
        // Ignore
      }
    });
  }

  destroy() {
    window.removeEventListener("scroll", this.handleScroll, true);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
    this.hide();
  }
}

export const BubbleMenu = (options: BubbleMenuPluginProps): Extension => {
  const extension = Extension.create({
    name: "bubbleMenu",
    addProseMirrorPlugins: () => [
      new Plugin({
        // Generate a unique key for each instance to prevent collisions
        key: new PluginKey(
          options.id
            ? `bubbleMenu-${options.id}`
            : `bubbleMenu-${Math.random().toString(36).substr(2, 9)}`
        ),
        view: (view) => new BubbleMenuView({ ...options, view }),
        update: (view) => {
          const pluginView = (view as any).pluginViews?.find(
            (pv: any) => pv instanceof BubbleMenuView && pv.id === options.id
          );
          if (pluginView) {
            pluginView.update(view);
          }
          return true;
        },
      }),
    ],
  });

  if (options.id) {
    extension.id = options.id;
  }

  return extension;
};

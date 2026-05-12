import { PMNode } from "@arkpad/core";
import { EditorView, PMNodeView as NodeView } from "@arkpad/core";
import { NodeSelection } from "@arkpad/core";

export class ImageNodeView implements NodeView {
  public dom: HTMLElement;
  public img: HTMLImageElement;
  public node: PMNode;
  public view: EditorView;
  public getPos: () => number | undefined;
  public container: HTMLElement;
  public wrapper: HTMLElement;
  public handles: HTMLElement[] = [];
  public isResizing = false;

  constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // 1. Root Element
    this.dom = document.createElement("div");
    this.dom.className = "ark-image-node-view";
    this.dom.style.display = "block";
    this.dom.style.width = "100%";
    this.dom.style.margin = "0.5rem 0";

    // 2. Container
    this.container = document.createElement("div");
    this.container.className = "ark-image-container";
    this.container.style.width = "100%";

    // 3. Wrapper
    this.wrapper = document.createElement("div");
    this.wrapper.className = "ark-image-wrapper";
    this.wrapper.style.position = "relative";
    this.wrapper.style.width = node.attrs.width || "100%";
    this.wrapper.style.lineHeight = "0";

    this.applyAlignment(node.attrs.align || "center");

    // 4. Image
    this.img = document.createElement("img");
    this.img.src = node.attrs.src;
    this.img.alt = node.attrs.alt || "";
    this.img.style.width = "100%";
    this.img.style.height = "auto";
    this.img.style.borderRadius = "8px";
    this.img.style.display = "block";
    this.img.style.pointerEvents = "auto";
    this.img.style.cursor = "pointer";
    this.img.style.transition = "box-shadow 0.2s ease";

    this.img.addEventListener("click", (e) => {
      e.preventDefault();
      const pos = this.getPos();
      if (pos !== undefined) {
        const { tr } = this.view.state;
        const selection = NodeSelection.create(tr.doc, pos);
        this.view.dispatch(tr.setSelection(selection));
      }
    });

    this.wrapper.appendChild(this.img);
    this.container.appendChild(this.wrapper);
    this.dom.appendChild(this.container);

    this.updateSelection();
  }

  private applyAlignment(align: string) {
    // Reset styles
    this.container.style.display = "block";
    this.wrapper.style.float = "none";
    this.wrapper.style.margin = "0";
    this.container.style.justifyContent = "initial";

    if (align === "left") {
      this.wrapper.style.float = "left";
      this.wrapper.style.margin = "0.5rem 1.5rem 0.5rem 0";
    } else if (align === "right") {
      this.wrapper.style.float = "right";
      this.wrapper.style.margin = "0.5rem 0 0.5rem 1.5rem";
    } else {
      // Center
      this.container.style.display = "flex";
      this.container.style.justifyContent = "center";
      this.wrapper.style.margin = "0.5rem 0";
    }
  }

  selectNode() {
    this.img.style.boxShadow = "0 0 0 2px var(--ark-primary, #7c3aed)";
    this.createHandles();
  }

  deselectNode() {
    this.img.style.boxShadow = "none";
    this.removeHandles();
  }

  private updateSelection() {
    const { selection } = this.view.state;
    const pos = this.getPos();
    if (pos !== undefined && selection instanceof NodeSelection && selection.from === pos) {
      this.selectNode();
    }
  }

  private createHandles() {
    if (this.handles.length > 0) return;

    const wrapper = this.wrapper;
    const positions = ["nw", "ne", "sw", "se"];

    positions.forEach((pos) => {
      const handle = document.createElement("div");
      handle.className = `ark-image-resizer-dot ark-resizer-${pos}`;

      Object.assign(handle.style, {
        position: "absolute",
        width: "10px",
        height: "10px",
        backgroundColor: "var(--ark-primary, #7c3aed)",
        border: "1px solid white",
        borderRadius: "2px",
        zIndex: "100",
        cursor: `${pos}-resize`,
      });

      if (pos.includes("n")) handle.style.top = "-5px";
      if (pos.includes("s")) handle.style.bottom = "-5px";
      if (pos.includes("w")) handle.style.left = "-5px";
      if (pos.includes("e")) handle.style.right = "-5px";

      handle.addEventListener("mousedown", (e) => this.onMouseDown(e, pos));
      wrapper.appendChild(handle);
      this.handles.push(handle);
    });
  }

  private removeHandles() {
    this.handles.forEach((h) => h.remove());
    this.handles = [];
  }

  private onMouseDown(e: MouseEvent, direction: string) {
    e.preventDefault();
    e.stopPropagation();

    this.isResizing = true;
    const startX = e.clientX;
    const startWidth = this.wrapper.clientWidth;
    const parentWidth = this.container.clientWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let deltaX = moveEvent.clientX - startX;
      if (direction.includes("w")) {
        deltaX = -deltaX;
      }

      const newWidth = Math.max(50, Math.min(parentWidth, startWidth + deltaX));
      this.wrapper.style.width = `${newWidth}px`;
    };

    const onMouseUp = () => {
      this.isResizing = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      const pos = this.getPos();
      if (pos !== undefined) {
        const finalWidth = `${(this.wrapper.clientWidth / parentWidth) * 100}%`;
        const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
          ...this.node.attrs,
          width: finalWidth,
        });
        this.view.dispatch(tr);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  update(node: PMNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;

    if (!this.isResizing) {
      this.img.src = node.attrs.src;
      this.wrapper.style.width = node.attrs.width || "100%";
      this.applyAlignment(node.attrs.align || "center");
    }

    return true;
  }

  stopEvent(): boolean {
    if (this.isResizing) return true;
    return false;
  }

  ignoreMutation(): boolean {
    return true;
  }
}

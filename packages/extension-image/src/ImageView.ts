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
  public tooltip: HTMLElement | null = null;
  public toolbar: HTMLElement | null = null;
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
    this.wrapper.style.display = "inline-block";
    this.wrapper.style.maxWidth = "100%";
    this.wrapper.style.width = node.attrs.width || "100%";
    this.wrapper.style.lineHeight = "0";
    this.wrapper.style.transition = "outline 0.15s ease-in-out";

    this.applyAlignment(node.attrs.align || "center");

    // 4. Image
    this.img = document.createElement("img");
    this.img.src = node.attrs.src;
    this.img.alt = node.attrs.alt || "";
    this.img.style.width = "100%";
    this.img.style.height = "auto";
    this.img.style.margin = "0";
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
      this.container.style.display = "flex";
      this.container.style.justifyContent = "center";
      this.wrapper.style.margin = "0.5rem 0";
    }
  }

  selectNode() {
    this.img.style.boxShadow = "0 0 0 2px var(--ark-primary, #7c3aed)";
    this.createHandles();
    this.createToolbar();
  }

  deselectNode() {
    this.img.style.boxShadow = "none";
    this.removeHandles();
    this.removeToolbar();
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
        width: "12px",
        height: "12px",
        backgroundColor: "var(--ark-primary, #7c3aed)",
        border: "2px solid white",
        borderRadius: "50%",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
        zIndex: "100",
        cursor: `${pos}-resize`,
        transition: "transform 0.15s ease",
      });

      handle.addEventListener("mouseenter", () => {
        handle.style.transform = "scale(1.25)";
      });
      handle.addEventListener("mouseleave", () => {
        handle.style.transform = "scale(1)";
      });

      if (pos.includes("n")) handle.style.top = "-6px";
      if (pos.includes("s")) handle.style.bottom = "-6px";
      if (pos.includes("w")) handle.style.left = "-6px";
      if (pos.includes("e")) handle.style.right = "-6px";

      // Mouse Events
      handle.addEventListener("mousedown", (e) => this.onStartResize(e, pos));
      // Touch Events (Mobile/Tablet support)
      handle.addEventListener("touchstart", (e) => this.onStartResize(e, pos), { passive: false });

      wrapper.appendChild(handle);
      this.handles.push(handle);
    });
  }

  private removeHandles() {
    this.handles.forEach((h) => h.remove());
    this.handles = [];
    this.removeTooltip();
  }

  private createToolbarButton(svgPath: string, title: string, onClick: () => void) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.title = title;
    Object.assign(btn.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "28px",
      height: "28px",
      border: "none",
      background: "none",
      borderRadius: "4px",
      color: "#e5e7eb",
      cursor: "pointer",
      padding: "4px",
      transition: "background-color 0.15s ease, color 0.15s ease",
    });
    btn.addEventListener("mouseenter", () => {
      btn.style.backgroundColor = "rgba(124, 58, 237, 0.2)";
      btn.style.color = "#a78bfa";
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.backgroundColor = "transparent";
      btn.style.color = "#e5e7eb";
    });
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", svgPath);
    svg.appendChild(path);
    btn.appendChild(svg);
    return btn;
  }

  private createToolbar() {
    if (this.toolbar) return;

    this.toolbar = document.createElement("div");
    this.toolbar.className = "ark-image-toolbar";
    Object.assign(this.toolbar.style, {
      position: "absolute",
      top: "-42px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "center",
      gap: "2px",
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "6px",
      padding: "2px 4px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      zIndex: "105",
      pointerEvents: "auto",
    });

    // 1. Align Left (alignLeft SVG)
    const alignLeftBtn = this.createToolbarButton("M4 6h16M4 12h10M4 18h14", "Align Left", () => {
      this.updateAlignmentAttribute("left");
    });

    // 2. Align Center (alignCenter SVG)
    const alignCenterBtn = this.createToolbarButton(
      "M4 6h16M6 12h12M4 18h16",
      "Align Center",
      () => {
        this.updateAlignmentAttribute("center");
      }
    );

    // 3. Align Right (alignRight SVG)
    const alignRightBtn = this.createToolbarButton(
      "M4 6h16M10 12h10M6 18h14",
      "Align Right",
      () => {
        this.updateAlignmentAttribute("right");
      }
    );

    // Separator
    const sep = document.createElement("div");
    Object.assign(sep.style, {
      width: "1px",
      height: "18px",
      backgroundColor: "#374151",
      margin: "0 4px",
    });

    // 4. Edit Alt text (file-text SVG)
    const altBtn = this.createToolbarButton(
      "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
      "Edit Alt Text",
      () => {
        const currentAlt = this.node.attrs.alt || "";
        const newAlt = prompt("Enter Alt Text / Caption:", currentAlt);
        if (newAlt !== null) {
          const pos = this.getPos();
          if (pos !== undefined) {
            const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
              ...this.node.attrs,
              alt: newAlt,
            });
            this.view.dispatch(tr);
          }
        }
      }
    );

    // 5. Delete (trash SVG)
    const deleteBtn = this.createToolbarButton(
      "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
      "Delete Image",
      () => {
        const pos = this.getPos();
        if (pos !== undefined) {
          const tr = this.view.state.tr.delete(pos, pos + this.node.nodeSize);
          this.view.dispatch(tr);
        }
      }
    );
    // Style delete button custom color
    deleteBtn.style.color = "#ef4444";
    deleteBtn.addEventListener("mouseenter", () => {
      deleteBtn.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
      deleteBtn.style.color = "#f87171";
    });

    this.toolbar.appendChild(alignLeftBtn);
    this.toolbar.appendChild(alignCenterBtn);
    this.toolbar.appendChild(alignRightBtn);
    this.toolbar.appendChild(sep);
    this.toolbar.appendChild(altBtn);
    this.toolbar.appendChild(deleteBtn);

    this.wrapper.appendChild(this.toolbar);
  }

  private removeToolbar() {
    if (this.toolbar) {
      this.toolbar.remove();
      this.toolbar = null;
    }
  }

  private updateAlignmentAttribute(align: string) {
    const pos = this.getPos();
    if (pos !== undefined) {
      const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
        ...this.node.attrs,
        align,
      });
      this.view.dispatch(tr);
    }
  }

  private createTooltip() {
    if (this.tooltip) return;
    this.tooltip = document.createElement("div");
    this.tooltip.className = "ark-resizer-tooltip";
    Object.assign(this.tooltip.style, {
      position: "absolute",
      top: "-30px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "2px 8px",
      borderRadius: "4px",
      fontSize: "11px",
      fontFamily: "sans-serif",
      pointerEvents: "none",
      zIndex: "101",
      whiteSpace: "nowrap",
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    });
    this.wrapper.appendChild(this.tooltip);
  }

  private updateTooltip(percent: number) {
    if (this.tooltip) {
      this.tooltip.textContent = `${percent}%`;
    }
  }

  private removeTooltip() {
    if (this.tooltip) {
      this.tooltip.remove();
      this.tooltip = null;
    }
  }

  private onStartResize(e: MouseEvent | TouchEvent, direction: string) {
    e.preventDefault();
    e.stopPropagation();

    this.isResizing = true;
    this.createTooltip();

    // Visual Outline Feedback
    this.wrapper.style.outline = "1.5px dashed var(--ark-primary, #7c3aed)";

    const isTouch = window.TouchEvent && e instanceof TouchEvent;
    const startX = isTouch ? (e as TouchEvent).touches[0]!.clientX : (e as MouseEvent).clientX;
    const startWidth = this.wrapper.clientWidth;
    const parentWidth = this.container.clientWidth;
    const align = this.node.attrs.align || "center";

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!this.isResizing) return;

      const currentX = "touches" in moveEvent ? moveEvent.touches[0]!.clientX : moveEvent.clientX;
      let deltaX = currentX - startX;

      if (direction.includes("w")) {
        deltaX = -deltaX;
      }

      // Symmetrical scaling for centered images
      if (align === "center") {
        deltaX *= 2;
      }

      const newWidth = Math.max(50, Math.min(parentWidth, startWidth + deltaX));
      const percent = Math.round((newWidth / parentWidth) * 100);
      this.wrapper.style.width = `${percent}%`;
      this.updateTooltip(percent);
    };

    const onEnd = () => {
      this.isResizing = false;
      this.wrapper.style.outline = "none";
      this.removeTooltip();

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);

      const pos = this.getPos();
      if (pos !== undefined) {
        const finalPercent = this.wrapper.style.width || "100%";
        const tr = this.view.state.tr.setNodeMarkup(pos, undefined, {
          ...this.node.attrs,
          width: finalPercent,
        });
        this.view.dispatch(tr);
      }
    };

    // Event callbacks
    const onMouseMove = (me: MouseEvent) => onMove(me);
    const onMouseUp = () => onEnd();
    const onTouchMove = (te: TouchEvent) => onMove(te);
    const onTouchEnd = () => onEnd();

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
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

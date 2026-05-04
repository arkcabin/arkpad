import { Node as PMNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { TableMap } from "prosemirror-tables";
import {
  selectColumn,
  selectRow,
  selectTable,
  isColumnSelected,
  isRowSelected,
  isTableSelected,
} from "./utils";

interface NodeViewRendererProps {
  editor: any;
  node: PMNode;
  getPos: () => number | undefined;
  decorations: any;
  view: EditorView;
  extension: any;
}

export class TableView implements NodeView {
  node: PMNode;
  view: EditorView;
  getPos: () => number | undefined;
  dom: HTMLElement;
  tableDOM: HTMLElement;
  colgroup: HTMLElement;
  tbody: HTMLElement;
  gripsContainer: HTMLElement;
  resizeObserver: ResizeObserver;
  mutationObserver: MutationObserver;

  constructor(props: NodeViewRendererProps) {
    this.node = props.node;
    this.view = props.view || props.editor?.view;
    this.getPos = props.getPos;

    // Create wrapper
    this.dom = document.createElement("div");
    this.dom.classList.add("tableWrapper");

    // The table element
    this.tableDOM = document.createElement("table");
    this.colgroup = document.createElement("colgroup");
    this.tbody = document.createElement("tbody");
    this.tableDOM.appendChild(this.colgroup);
    this.tableDOM.appendChild(this.tbody);

    if (this.node.attrs.style) {
      this.tableDOM.setAttribute("style", this.node.attrs.style);
    }
    this.dom.appendChild(this.tableDOM);

    // Overlay for grips
    this.gripsContainer = document.createElement("div");
    this.gripsContainer.classList.add("table-grips-container");
    this.gripsContainer.style.pointerEvents = "none";
    this.dom.appendChild(this.gripsContainer);

    this.mutationObserver = new MutationObserver(() => {
      this.updateGripPositions();
    });
    this.mutationObserver.observe(this.colgroup, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["style"],
    });

    this.renderGrips();
    this.updateColgroup();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.view && !(this.view as any).isDestroyed) {
        window.requestAnimationFrame(() => this.updateGripPositions());
      }
    });
    this.resizeObserver.observe(this.tableDOM);

    // Row Resizing Logic
    let startY = 0;
    let startHeight = 0;
    let resizingRowIdx = -1;

    const onMouseMove = (e: MouseEvent) => {
      if (resizingRowIdx === -1) return;
      const deltaY = e.clientY - startY;
      const newHeight = Math.max(25, startHeight + deltaY);
      const rows = this.tbody.querySelectorAll("tr");
      const row = rows[resizingRowIdx] as HTMLElement;
      if (row) {
        row.style.height = `${newHeight}px`;
        this.updateGripPositions();
      }
    };

    const onMouseUp = () => {
      if (resizingRowIdx !== -1) {
        const rows = this.tbody.querySelectorAll("tr");
        const row = rows[resizingRowIdx] as HTMLElement;
        const newHeight = parseInt(row.style.height, 10);
        const pos = this.getPos();
        if (pos !== undefined) {
          const { tr } = this.view.state;
          const map = TableMap.get(this.node);
          const rowPos = pos + map.positionAt(resizingRowIdx, 0, this.node) - 1;
          this.view.dispatch(tr.setNodeMarkup(rowPos, undefined, { height: newHeight }));
        }
      }
      resizingRowIdx = -1;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      this.dom.classList.remove("resize-cursor-row");
    };

    this.gripsContainer.addEventListener("mousedown", (e) => {
      const target = e.target as HTMLElement;

      // Handle Row Resizing
      if (target.classList.contains("grip-row-handle")) {
        e.preventDefault();
        e.stopPropagation();
        const grip = target.parentElement!;
        resizingRowIdx = parseInt(grip.getAttribute("data-row")!, 10);
        startY = e.clientY;
        const rows = this.tbody.querySelectorAll("tr");
        startHeight = (rows[resizingRowIdx] as HTMLElement).offsetHeight;
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        this.dom.classList.add("resize-cursor-row");
        return;
      }

      const pos = this.getPos();
      if (pos === undefined) return;

      const isGrip =
        target.classList.contains("grip-table") ||
        target.hasAttribute("data-col") ||
        target.hasAttribute("data-row");

      if (!isGrip) return;

      e.preventDefault();
      e.stopPropagation();

      if (target.classList.contains("grip-table")) {
        selectTable(this.view, pos);
      } else if (target.hasAttribute("data-col")) {
        selectColumn(this.view, pos, parseInt(target.getAttribute("data-col")!, 10));
      } else if (target.hasAttribute("data-row")) {
        selectRow(this.view, pos, parseInt(target.getAttribute("data-row")!, 10));
      }
    });

    this.mutationObserver = new MutationObserver(() => {
      this.updateGripPositions();
    });
    this.mutationObserver.observe(this.colgroup, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ["style"],
    });

    this.resizeObserver = new ResizeObserver(() => {
      if (this.view && !(this.view as any).isDestroyed) {
        window.requestAnimationFrame(() => this.updateGripPositions());
      }
    });
    this.resizeObserver.observe(this.tableDOM);
  }

  updateColgroup() {
    const map = TableMap.get(this.node);

    // Sync number of <col> tags
    while (this.colgroup.children.length < map.width) {
      this.colgroup.appendChild(document.createElement("col"));
    }
    while (this.colgroup.children.length > map.width) {
      this.colgroup.lastElementChild?.remove();
    }

    const firstRow = this.node.firstChild;
    if (!firstRow) return;

    let colIndex = 0;
    let totalWidth = 0;
    let hasVariableWidth = false;

    firstRow.forEach((cell) => {
      const { colspan, colwidth } = cell.attrs;
      for (let i = 0; i < colspan; i++) {
        const width = colwidth && colwidth[i] ? colwidth[i] : null;
        const col = this.colgroup.children[colIndex] as HTMLElement;
        if (col) {
          if (width) {
            col.style.width = `${width}px`;
            totalWidth += width;
          } else {
            col.style.width = "";
            totalWidth += 150; // Use a default for calculation to prevent table shrinking
          }
        }
        colIndex++;
      }
    });

    const newWidth = totalWidth > 0 ? `${totalWidth}px` : "100%";
    const newMinWidth = "100%";

    if (this.tableDOM.style.width !== newWidth) {
      this.tableDOM.style.width = newWidth;
    }
    if (this.tableDOM.style.minWidth !== newMinWidth) {
      this.tableDOM.style.minWidth = newMinWidth;
    }
  }

  renderGrips() {
    try {
      this.gripsContainer.innerHTML = "";
      const map = TableMap.get(this.node);
      if (!map) return;

      const corner = document.createElement("div");
      corner.classList.add("grip-table");
      corner.style.pointerEvents = "auto";
      this.gripsContainer.appendChild(corner);

      for (let i = 0; i < map.width; i++) {
        const grip = document.createElement("div");
        grip.classList.add("grip-column");
        grip.setAttribute("data-col", i.toString());
        grip.style.pointerEvents = "auto";
        this.gripsContainer.appendChild(grip);
      }

      for (let i = 0; i < map.height; i++) {
        const grip = document.createElement("div");
        grip.classList.add("grip-row");
        grip.setAttribute("data-row", i.toString());
        grip.style.pointerEvents = "auto";

        const handle = document.createElement("div");
        handle.classList.add("grip-row-handle");
        grip.appendChild(handle);

        this.gripsContainer.appendChild(grip);
      }

      this.updateGripPositions();
    } catch (error) {
      console.warn("TableView: Failed to render grips", error);
    }
  }

  updateGripPositions() {
    try {
      const table = this.tableDOM;
      const pos = this.getPos();
      if (pos === undefined || !this.view || (this.view as any).isDestroyed) return;

      const map = TableMap.get(this.node);
      if (!map) return;

      const tableRect = table.getBoundingClientRect();
      const wrapperRect = this.dom.getBoundingClientRect();

      if (tableRect.width === 0 || tableRect.height === 0) return;

      const scrollLeft = this.dom.scrollLeft;
      const scrollTop = this.dom.scrollTop;

      this.gripsContainer.style.top = `${tableRect.top - wrapperRect.top + scrollTop}px`;
      this.gripsContainer.style.left = `${tableRect.left - wrapperRect.left + scrollLeft}px`;
      this.gripsContainer.style.width = `${tableRect.width}px`;
      this.gripsContainer.style.height = `${tableRect.height}px`;

      const colGrips = this.gripsContainer.querySelectorAll(".grip-column");
      const rowGrips = this.gripsContainer.querySelectorAll(".grip-row");

      const rows = table.querySelectorAll("tr");
      if (rows.length === 0) return;

      // Column grips (Optimized: using table children instead of getBoundingClientRect in loop)
      const colElements = this.colgroup.querySelectorAll("col");
      let currentLeft = 0;
      colElements.forEach((col, i) => {
        const width = (col as HTMLElement).offsetWidth || (col as any).width || 0;
        const grip = colGrips[i] as HTMLElement | undefined;
        if (grip) {
          grip.style.left = `${currentLeft}px`;
          grip.style.width = `${width}px`;
        }
        currentLeft += width;
      });

      // Row grips (Optimized: using tr offsetHeight)
      let currentTop = 0;
      rows.forEach((row, i) => {
        const height = (row as HTMLElement).offsetHeight;
        const grip = rowGrips[i] as HTMLElement | undefined;
        if (grip) {
          grip.style.top = `${currentTop}px`;
          grip.style.height = `${height}px`;
        }
        currentTop += height;
      });

      this.updateGripSelection();
    } catch (error) {
      console.warn("TableView: Failed to update grip positions", error);
    }
  }

  updateGripSelection() {
    try {
      const pos = this.getPos();
      if (pos === undefined) return;

      const state = this.view.state;
      const isTableActive = isTableSelected(state, pos);

      const corner = this.gripsContainer.querySelector(".grip-table");
      if (corner) {
        corner.classList.toggle("selected", isTableActive);
      }

      const colGrips = this.gripsContainer.querySelectorAll(".grip-column");
      colGrips.forEach((grip, i) => {
        grip.classList.toggle("selected", isTableActive || isColumnSelected(state, pos, i));
      });

      const rowGrips = this.gripsContainer.querySelectorAll(".grip-row");
      rowGrips.forEach((grip, i) => {
        grip.classList.toggle("selected", isTableActive || isRowSelected(state, pos, i));
      });
    } catch (error) {
      console.warn("TableView: Failed to update grip selection", error);
    }
  }

  update(node: PMNode) {
    if (node.type !== this.node.type) return false;

    const oldNode = this.node;
    this.node = node;

    // Sync attributes
    const newStyle = this.node.attrs.style || "";
    if (this.tableDOM.getAttribute("style") !== newStyle) {
      if (newStyle) {
        this.tableDOM.setAttribute("style", newStyle);
      } else {
        this.tableDOM.removeAttribute("style");
      }
    }

    try {
      const map = TableMap.get(this.node);
      const oldMap = TableMap.get(oldNode);

      if (map.width !== oldMap.width || map.height !== oldMap.height) {
        this.renderGrips();
      } else {
        this.updateGripPositions();
        this.updateGripSelection();
      }

      // Only update colgroup if something actually changed to prevent scroll jumping
      if (
        map.width !== oldMap.width ||
        JSON.stringify(this.node.attrs) !== JSON.stringify(oldNode.attrs) ||
        this.node.content.size !== oldNode.content.size
      ) {
        this.updateColgroup();
      }
    } catch (error) {
      console.warn("TableView: Failed to update TableView", error);
    }
    return true;
  }

  destroy() {
    this.resizeObserver.disconnect();
    this.mutationObserver.disconnect();
  }

  ignoreMutation(mutation: any) {
    return (
      mutation.target === this.gripsContainer ||
      this.gripsContainer.contains(mutation.target) ||
      mutation.target === this.colgroup ||
      this.colgroup.contains(mutation.target)
    );
  }

  get contentDOM() {
    return this.tbody;
  }
}

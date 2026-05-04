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
  tbody: HTMLElement;
  gripsContainer: HTMLElement;
  resizeObserver: ResizeObserver;

  constructor(props: NodeViewRendererProps) {
    this.node = props.node;
    this.view = props.view || props.editor?.view;
    this.getPos = props.getPos;

    // Create wrapper
    this.dom = document.createElement("div");
    this.dom.classList.add("tableWrapper");

    // The table element managed by ProseMirror
    this.tableDOM = document.createElement("table");
    if (this.node.attrs.style) {
      this.tableDOM.setAttribute("style", this.node.attrs.style);
    }

    this.tbody = document.createElement("tbody");
    this.tableDOM.appendChild(this.tbody);
    this.dom.appendChild(this.tableDOM);

    // Overlay for grips
    this.gripsContainer = document.createElement("div");
    this.gripsContainer.classList.add("table-grips-container");
    this.gripsContainer.style.pointerEvents = "none";
    this.dom.appendChild(this.gripsContainer);

    this.renderGrips();

    this.gripsContainer.addEventListener("mousedown", (e) => {
      const target = e.target as HTMLElement;
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

    this.resizeObserver = new ResizeObserver(() => {
      if (this.view && !(this.view as any).isDestroyed) {
        window.requestAnimationFrame(() => this.updateGripPositions());
      }
    });
    this.resizeObserver.observe(this.tableDOM);

    this.dom.addEventListener("scroll", () => {
      if (this.view && !(this.view as any).isDestroyed) {
        window.requestAnimationFrame(() => this.updateGripPositions());
      }
    });
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

      const firstRow = rows[0];
      if (!firstRow) return;
      const cells = firstRow.querySelectorAll("td, th");
      let currentLeft = 0;
      let colIdx = 0;

      cells.forEach((cell: any) => {
        const rect = cell.getBoundingClientRect();
        const colspan = parseInt(cell.getAttribute("colspan") || "1", 10);
        const colWidth = rect.width / colspan;

        for (let j = 0; j < colspan; j++) {
          const grip = colGrips[colIdx] as HTMLElement | undefined;
          if (grip) {
            grip.style.left = `${currentLeft}px`;
            grip.style.width = `${colWidth}px`;
          }
          currentLeft += colWidth;
          colIdx++;
        }
      });

      let currentTop = 0;
      rows.forEach((row, i) => {
        const rect = row.getBoundingClientRect();
        const grip = rowGrips[i] as HTMLElement | undefined;
        if (grip) {
          grip.style.top = `${currentTop}px`;
          grip.style.height = `${rect.height}px`;
        }
        currentTop += rect.height;
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
    this.node = node;

    // Sync attributes (critical for resizing and persistence)
    if (this.node.attrs.style) {
      this.tableDOM.setAttribute("style", this.node.attrs.style);
    } else {
      this.tableDOM.removeAttribute("style");
    }

    try {
      const map = TableMap.get(this.node);
      if (
        this.gripsContainer.querySelectorAll(".grip-column").length !== map.width ||
        this.gripsContainer.querySelectorAll(".grip-row").length !== map.height
      ) {
        this.renderGrips();
      } else {
        this.updateGripPositions();
        this.updateGripSelection();
      }
    } catch (error) {
      console.warn("TableView: Failed to update TableView", error);
    }
    return true;
  }

  destroy() {
    this.resizeObserver.disconnect();
  }

  ignoreMutation(mutation: any) {
    // Only ignore mutations to the grips container
    return mutation.target === this.gripsContainer || this.gripsContainer.contains(mutation.target);
  }

  get contentDOM() {
    return this.tbody;
  }
}

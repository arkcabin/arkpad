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

  constructor(props: NodeViewRendererProps) {
    this.node = props.node;
    this.view = props.view || props.editor?.view;
    this.getPos = props.getPos;

    if (!this.view) {
      console.warn("TableView: EditorView is missing in props");
    }

    this.dom = document.createElement("div");
    this.dom.classList.add("tableWrapper");

    this.tableDOM = document.createElement("table");
    this.colgroup = document.createElement("colgroup");
    this.tbody = document.createElement("tbody");
    this.tableDOM.appendChild(this.colgroup);
    this.tableDOM.appendChild(this.tbody);
    this.dom.appendChild(this.tableDOM);

    this.gripsContainer = document.createElement("div");
    this.gripsContainer.classList.add("table-grips-container");
    this.gripsContainer.style.pointerEvents = "none";
    this.dom.appendChild(this.gripsContainer);

    this.renderGrips();
    this.updateColgroup();

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

    this.gripsContainer.addEventListener("dragstart", (e) => {
      e.preventDefault();
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
      this.gripsContainer.appendChild(corner);

      for (let i = 0; i < map.width; i++) {
        const grip = document.createElement("div");
        grip.classList.add("grip-column");
        grip.setAttribute("data-col", i.toString());
        this.gripsContainer.appendChild(grip);
      }

      for (let i = 0; i < map.height; i++) {
        const grip = document.createElement("div");
        grip.classList.add("grip-row");
        grip.setAttribute("data-row", i.toString());
        this.gripsContainer.appendChild(grip);
      }

      this.updateGripPositions();
    } catch (error) {
      console.warn("TableView: Failed to render grips", error);
    }
  }

  updateColgroup() {
    try {
      // Sync table attributes
      this.tableDOM.className = this.node.attrs.class || "";
      if (this.node.attrs.style) {
        this.tableDOM.setAttribute("style", this.node.attrs.style);
      } else {
        this.tableDOM.removeAttribute("style");
      }

      const map = TableMap.get(this.node);
      if (!map) return;

      const firstRow = this.node.firstChild;
      if (!firstRow) return;

      const colWidths = new Array(map.width).fill(0);
      let colIdx = 0;

      for (let i = 0; i < firstRow.childCount; i++) {
        const cell = firstRow.child(i);
        const { colspan, colwidth } = cell.attrs;
        for (let j = 0; j < (colspan || 1); j++) {
          if (colwidth && colwidth[j]) {
            colWidths[colIdx] = colwidth[j];
          }
          colIdx++;
        }
      }

      // Sync <col> elements without recreating them to avoid flicker
      let col = this.colgroup.firstElementChild;
      for (let i = 0; i < map.width; i++) {
        if (!col) {
          col = document.createElement("col");
          this.colgroup.appendChild(col);
        }
        const width = colWidths[i];
        const style = width ? `width: ${width}px;` : "";
        if (col.getAttribute("style") !== style) {
          col.setAttribute("style", style);
        }
        col = col.nextElementSibling;
      }

      while (col) {
        const next = col.nextElementSibling;
        this.colgroup.removeChild(col);
        col = next;
      }
    } catch (error) {
      console.warn("TableView: Failed to update colgroup", error);
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

      for (let i = 0; i < map.width; i++) {
        const grip = colGrips[i] as HTMLElement | undefined;
        if (!grip) continue;

        const cellPos = map.map[i];
        if (cellPos === undefined) continue;

        const cellDOM = this.view.nodeDOM(pos + cellPos + 1) as HTMLElement;
        if (cellDOM && typeof cellDOM.getBoundingClientRect === "function") {
          const rect = cellDOM.getBoundingClientRect();
          const colspan = parseInt(cellDOM.getAttribute("colspan") || "1", 10);
          const colWidth = rect.width / colspan;

          let subColIdx = 0;
          for (let prevIdx = 0; prevIdx < i; prevIdx++) {
            if (map.map[prevIdx] === cellPos) subColIdx++;
          }

          grip.style.left = `${rect.left - tableRect.left + subColIdx * colWidth}px`;
          grip.style.width = `${colWidth}px`;
        }
      }

      for (let i = 0; i < map.height; i++) {
        const grip = rowGrips[i] as HTMLElement | undefined;
        if (!grip) continue;

        const cellPos = map.map[i * map.width];
        if (cellPos === undefined) continue;

        const cellDOM = this.view.nodeDOM(pos + cellPos + 1) as HTMLElement;
        if (cellDOM && typeof cellDOM.getBoundingClientRect === "function") {
          const rect = cellDOM.getBoundingClientRect();
          const rowspan = parseInt(cellDOM.getAttribute("rowspan") || "1", 10);
          const rowHeight = rect.height / rowspan;

          let subRowIdx = 0;
          for (let prevIdx = 0; prevIdx < i; prevIdx++) {
            if (map.map[prevIdx * map.width] === cellPos) subRowIdx++;
          }

          grip.style.top = `${rect.top - tableRect.top + subRowIdx * rowHeight}px`;
          grip.style.height = `${rowHeight}px`;
        }
      }

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

  update(node: PMNode, decorations: any) {
    void decorations;
    if (node.type !== this.node.type) return false;
    this.node = node;

    this.updateColgroup();

    try {
      const map = TableMap.get(this.node);
      if (
        this.gripsContainer.querySelectorAll(".grip-column").length !== map.width ||
        this.gripsContainer.querySelectorAll(".grip-row").length !== map.height
      ) {
        this.renderGrips();
      } else {
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
    return mutation.target === this.gripsContainer || this.gripsContainer.contains(mutation.target);
  }

  selectNode() {
    this.dom.classList.add("ProseMirror-selectednode");
    this.updateGripSelection();
  }

  deselectNode() {
    this.dom.classList.remove("ProseMirror-selectednode");
    this.updateGripSelection();
  }

  get contentDOM() {
    return this.tbody;
  }
}

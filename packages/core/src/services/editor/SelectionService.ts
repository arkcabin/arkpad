import { TextSelection } from "prosemirror-state";
import { IArkpadEditor } from "../../api";

/**
 * SelectionService handles all selection-related operations, including 
 * cell selections, coordinate resolution, and virtual selections (ghost cursors).
 */
export class SelectionService {
  private virtualSelections: Map<string, any> = new Map();

  constructor(private editor: IArkpadEditor) {}

  public getSelection() {
    const { selection } = this.editor.getState();
    const { from, to, empty } = selection;
    const cellSelection = selection as any;

    if (cellSelection.anchorCell && cellSelection.headCell) {
      return {
        from,
        to,
        empty: false,
        isCellSelection: true,
        anchorCell: cellSelection.anchorCell,
        headCell: cellSelection.headCell,
        ranges: cellSelection.ranges,
      };
    }
    return { from, to, empty, isCellSelection: false };
  }

  public setSelection(range: { from: number; to: number } | number) {
    const state = this.editor.getState();
    const { tr, doc } = state;
    const from = typeof range === "number" ? range : range.from;
    const to = typeof range === "number" ? range : range.to;

    this.editor.dispatch(tr.setSelection(TextSelection.create(doc, from, to)));
  }

  public selectAll() {
    this.setSelection({ from: 0, to: this.editor.getState().doc.content.size });
  }

  public getCoords(pos?: number) {
    const view = this.editor.getView();
    const state = this.editor.getState();
    const { selection } = state;

    if (!pos && (selection as any).anchorCell) {
      try {
        const cellSelection = selection as any;
        const anchorPos =
          cellSelection.anchorCell ||
          (cellSelection.$anchorCell ? cellSelection.$anchorCell.pos : 0);
        const headPos =
          cellSelection.headCell || (cellSelection.$headCell ? cellSelection.$headCell.pos : 0);
        if (anchorPos && headPos) {
          const anchorCoords = view.coordsAtPos(anchorPos + 1);
          const headCoords = view.coordsAtPos(headPos + 1);
          return {
            top: Math.min(anchorCoords.top, headCoords.top),
            bottom: Math.max(anchorCoords.bottom, headCoords.bottom),
            left: Math.min(anchorCoords.left, headCoords.left),
            right: Math.max(anchorCoords.right, headCoords.right),
          };
        }
      } catch {
        // Coords resolution failed for cell selection
      }
    }

    const safePos = Math.max(0, Math.min(pos ?? selection.from, state.doc.content.size));
    try {
      return view.coordsAtPos(safePos);
    } catch {
      return null;
    }
  }

  public getVirtualSelections() {
    return this.virtualSelections;
  }

  public setVirtualSelection(
    id: string,
    options: { from: number; to: number; color: string; label?: string }
  ) {
    this.virtualSelections.set(id, options);
    const tr = this.editor.getState().tr;
    tr.setMeta("virtual-selection-update", id);
    this.editor.dispatch(tr);
  }

  public removeVirtualSelection(id: string) {
    this.virtualSelections.delete(id);
    const tr = this.editor.getState().tr;
    tr.setMeta("virtual-selection-update", id);
    this.editor.dispatch(tr);
  }
}

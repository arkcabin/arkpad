import { TextSelection, NodeSelection, AllSelection } from "prosemirror-state";
import { IArkpadEditor } from "../../api";

/**
 * SelectionService handles all selection-related operations, including
 * cell selections, coordinate resolution, and virtual selections (ghost cursors).
 */
export class SelectionService {
  private virtualSelections: Map<string, any> = new Map();
  private lastPath: string[] = [];

  constructor(private editor: IArkpadEditor) {}

  /**
   * Tracks changes in the selection path and triggers enter/exit hooks.
   */
  public updateContext(tr: any) {
    const { $from } = tr.selection;
    const currentPath: string[] = [];

    // Calculate selection path (breadcrumbs)
    for (let i = 0; i <= $from.depth; i++) {
      currentPath.push($from.node(i).type.name);
    }

    // Identify EXITED and ENTERED nodes by comparing paths index-by-index
    const maxDepth = Math.max(this.lastPath.length, currentPath.length);
    const exited: string[] = [];
    const entered: string[] = [];

    // Find the first index where paths diverge
    let divergenceIndex = 0;
    while (
      divergenceIndex < maxDepth &&
      this.lastPath[divergenceIndex] === currentPath[divergenceIndex]
    ) {
      divergenceIndex++;
    }

    // Everything from divergenceIndex onwards in lastPath was EXITED
    for (let i = this.lastPath.length - 1; i >= divergenceIndex; i--) {
      exited.push(this.lastPath[i]!);
    }

    // Everything from divergenceIndex onwards in currentPath was ENTERED
    for (let i = divergenceIndex; i < currentPath.length; i++) {
      entered.push(currentPath[i]!);
    }

    const hookManager = this.editor.hookManager;

    // IMPORTANT: Update state BEFORE triggering hooks to prevent infinite recursion
    // if a hook triggers a command that updates selection.
    this.lastPath = currentPath;

    if (hookManager) {
      exited.forEach((name) => hookManager.triggerNodeExit(name, tr));
      entered.forEach((name) => hookManager.triggerNodeEnter(name, tr));
    }
  }

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

  /**
   * Returns the currently selected node if it's a NodeSelection.
   */
  public getSelectedNode() {
    const { selection } = this.editor.getState();
    return (selection as any).node || null;
  }

  /**
   * Clears any specific node selection by selecting the entire document.
   * This is used when navigating to the Page Root.
   */
  public deselectAll() {
    const { tr, doc } = this.editor.getState();
    this.editor.dispatch(tr.setSelection(new AllSelection(doc)));
  }

  /**
   * Selects a node at the given position.
   */
  public selectNodeAt(pos: number) {
    const { tr, doc } = this.editor.getState();
    try {
      this.editor.dispatch(tr.setSelection(NodeSelection.create(doc, pos)));
    } catch (e) {
      console.warn("Could not select node at pos", pos, e);
    }
  }
}

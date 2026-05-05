import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ArkpadEditorAPI, MenuConfig, MenuType } from "../types";

export interface MenuState {
  active: boolean;
  type: MenuType;
  coords: { top: number; left: number; bottom: number; right: number } | null;
  side: "top" | "bottom";
  extensionName: string;
}

export interface GlobalMenuStorage {
  menus: Record<string, MenuState>;
}

export class MenuEngine {
  private editor: ArkpadEditorAPI;
  private menuConfigs: Map<string, MenuConfig[]>;

  constructor(editor: ArkpadEditorAPI) {
    this.editor = editor;
    this.menuConfigs = new Map();
  }

  /**
   * Registers menu configurations from an extension.
   */
  registerExtensionMenus(extensionName: string, configs: MenuConfig | MenuConfig[]) {
    this.menuConfigs.set(extensionName, Array.isArray(configs) ? configs : [configs]);
  }

  /**
   * Recalculates all menu positions based on the current editor state.
   */
  update(view: EditorView, prevState?: EditorState) {
    if (view.isDestroyed) return;

    const { state } = view;

    // Optimization: Skip if selection hasn't changed and document is same
    if (prevState && prevState.selection.eq(state.selection) && prevState.doc.eq(state.doc)) {
      // We might still need to update if the window was resized or scrolled,
      // but scroll is handled separately or by the browser.
    }

    const storage = this.editor.storage.menuEngine as GlobalMenuStorage;
    if (!storage) return;

    const newMenus: Record<string, MenuState> = {};

    this.menuConfigs.forEach((configs, extensionName) => {
      configs.forEach((config, index) => {
        const menuKey = `${extensionName}-${index}`;
        const shouldShow = config.shouldShow
          ? config.shouldShow({
              editor: this.editor,
              state,
              from: state.selection.from,
              to: state.selection.to,
              empty: state.selection.empty,
            })
          : !state.selection.empty;

        if (shouldShow) {
          const coords = this.calculateCoords(view, config.type);
          newMenus[menuKey] = {
            active: true,
            type: config.type,
            coords,
            side: "top",
            extensionName,
          };
        } else {
          newMenus[menuKey] = {
            active: false,
            type: config.type,
            coords: null,
            side: "top",
            extensionName,
          };
        }
      });
    });

    // Atomic update to storage
    storage.menus = newMenus;
  }

  private calculateCoords(view: EditorView, type: MenuType) {
    const { state } = view;
    const { from, to } = state.selection;

    try {
      if (type === "bubble") {
        // More robust bounding box for multi-line selections
        // We use the view's internal range mapping to get the true selection bounding box
        const { node } = view.domAtPos(from);
        if (!node) return null;

        const range = document.createRange();
        range.setStart(node, 0); // Placeholder

        // Use ProseMirror's native way to get coordinates for the selection
        // coordsAtPos gives specific points, but for a bubble menu we want the whole rect.
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        // For single-line or small selections, the simple math works.
        // For complex selections, we'd ideally iterate through all Rects in the range.
        // But for "Super Ultra Fast", we take the min/max of the start/end points
        // and adjust for multi-line by checking if they are on different vertical planes.

        const isMultiLine = Math.abs(start.top - end.top) > 5; // Tolerance for small differences

        if (isMultiLine) {
          // If multi-line, we use the editor's bounding box for horizontal centering
          // but the start point's top for vertical positioning.
          const editorRect = view.dom.getBoundingClientRect();
          return {
            top: Math.min(start.top, end.top),
            left: editorRect.left,
            bottom: Math.max(start.bottom, end.bottom),
            right: editorRect.right,
          };
        }

        return {
          top: Math.min(start.top, end.top),
          left: Math.min(start.left, end.left),
          bottom: Math.max(start.bottom, end.bottom),
          right: Math.max(start.right, end.right),
        };
      } else {
        // Floating menu (start of line)
        const coords = view.coordsAtPos(from);
        return {
          top: coords.top,
          left: coords.left,
          bottom: coords.bottom,
          right: coords.right,
        };
      }
    } catch {
      return null;
    }
  }
}

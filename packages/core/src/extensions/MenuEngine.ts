import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ArkpadEditorAPI, MenuConfig, MenuType } from "../types";

export interface MenuState {
  active: boolean;
  type: MenuType;
  coords: { top: number; left: number; bottom: number; right: number } | null;
  side: "top" | "bottom";
  extensionName: string;
  isFirstShow: boolean;
}

export interface GlobalMenuStorage {
  menus: Record<string, MenuState>;
}

export class MenuEngine {
  private editor: ArkpadEditorAPI;
  private menuConfigs: Map<string, MenuConfig[]>;
  private prevMenuKeys: Set<string> = new Set();

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
   * Uses native DOM Range for pixel-perfect bounding boxes.
   */
  update(view: EditorView, prevState?: EditorState) {
    if (view.isDestroyed) return;

    const { state } = view;

    // Optimization: Skip calculation if selection and document are identical
    if (prevState && prevState.selection.eq(state.selection) && prevState.doc.eq(state.doc)) {
      return;
    }

    const storage = this.editor.storage.menuEngine as GlobalMenuStorage;
    if (!storage) return;

    const newMenus: Record<string, MenuState> = {};
    const currentMenuKeys = new Set<string>();

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
          currentMenuKeys.add(menuKey);
          const coords = this.calculateCoords(view, config.type);
          const isFirstShow = !this.prevMenuKeys.has(menuKey);

          newMenus[menuKey] = {
            active: true,
            type: config.type,
            coords,
            side: "top",
            extensionName,
            isFirstShow,
          };
        } else {
          newMenus[menuKey] = {
            active: false,
            type: config.type,
            coords: null,
            side: "top",
            extensionName,
            isFirstShow: false,
          };
        }
      });
    });

    // Atomic update to storage
    storage.menus = newMenus;
    this.prevMenuKeys = currentMenuKeys;
  }

  private calculateCoords(view: EditorView, type: MenuType) {
    const { state } = view;
    const { from, to, empty } = state.selection;

    try {
      if (type === "bubble" && !empty) {
        // Industry-standard bounding box calculation using DOM Range
        const range = document.createRange();
        const start = view.domAtPos(from);
        const end = view.domAtPos(to);

        if (start.node && end.node) {
          range.setStart(start.node, start.offset);
          range.setEnd(end.node, end.offset);

          const rect = range.getBoundingClientRect();

          // If the rect has no width (e.g. selection across lines), fallback to ProseMirror coords
          if (rect.width > 0) {
            return {
              top: rect.top,
              left: rect.left,
              bottom: rect.bottom,
              right: rect.right,
            };
          }
        }

        // Fallback for complex selections that Range cannot handle reliably
        const startCoords = view.coordsAtPos(from);
        const endCoords = view.coordsAtPos(to);
        return {
          top: Math.min(startCoords.top, endCoords.top),
          left: Math.min(startCoords.left, endCoords.left),
          bottom: Math.max(startCoords.bottom, endCoords.bottom),
          right: Math.max(startCoords.right, endCoords.right),
        };
      } else {
        // Floating menu (insertion point)
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

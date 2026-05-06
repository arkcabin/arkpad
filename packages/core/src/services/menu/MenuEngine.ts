import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { IArkpadEditor, MenuConfig, MenuType } from "../../api";

export interface MenuState {
  active: boolean;
  type: MenuType;
  coords: { top: number; left: number; bottom: number; right: number } | null;
  side: "top" | "bottom";
  extensionName: string;
  isFirstShow: boolean;
  metadata?: {
    activeNode: string | null;
    attributes: Record<string, any>;
    availableCommands: string[];
    path: string[];
  };
}

export interface GlobalMenuStorage {
  menus: Record<string, MenuState>;
  locks: string[];
  isLocked: boolean;
}

export class MenuEngine {
  private editor: IArkpadEditor;
  private menuConfigs: Map<string, MenuConfig[]>;
  private prevMenuKeys: Set<string> = new Set();
  private activeLocks: Set<string> = new Set();

  constructor(editor: IArkpadEditor) {
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
   * Locks the UI to suppress menus.
   */
  lock(name: string) {
    this.activeLocks.add(name);
    this.updateStorageLocks();
    this.editor.refresh();
  }

  /**
   * Unlocks the UI.
   */
  unlock(name: string) {
    this.activeLocks.delete(name);
    this.updateStorageLocks();
    this.editor.refresh();
  }

  private updateStorageLocks() {
    const storage = this.editor.storage.menuEngine as GlobalMenuStorage;
    if (storage) {
      storage.locks = Array.from(this.activeLocks);
      storage.isLocked = this.activeLocks.size > 0;
    }
  }

  /**
   * Recalculates all menu positions based on the current editor state.
   */
  update(view: EditorView, prevState?: EditorState, force = false) {
    if (view.isDestroyed) return;

    const { state } = view;
    const storage = this.editor.storage.menuEngine as GlobalMenuStorage;
    if (!storage) return;

    if (force) return;

    // Universal Guard: If locked, clear menus and stop
    if (this.activeLocks.size > 0) {
      if (Object.keys(storage.menus).length > 0) {
        storage.menus = {};
      }
      return;
    }

    // Optimization: Skip calculation if selection and document are identical
    if (prevState && prevState.selection.eq(state.selection) && prevState.doc.eq(state.doc)) {
      return;
    }

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
            metadata: this.generateMetadata(state),
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

  /**
   * Generates JSON metadata for the current selection.
   * This is the "Headless" heart of the Page Builder UI.
   */
  private generateMetadata(state: EditorState) {
    const { $from } = state.selection;

    // 1. Resolve Active Node (Smart fallback for Leaf nodes)
    const selection = state.selection as any;
    const node = selection.node || $from.parent;
    const activeNode = node.type.name;
    const attributes = node.attrs;

    // 2. Resolve Selection Path (Breadcrumbs)
    const path: string[] = [];
    for (let i = 0; i <= $from.depth; i++) {
      path.push($from.node(i).type.name);
    }

    // 3. Fast Command Indexing
    const availableCommands: string[] = [];
    const commandNames = Object.keys(this.editor.extensionManager.commands);

    for (const name of commandNames) {
      if (this.editor.canRunCommand(name)) {
        availableCommands.push(name);
      }
    }

    return {
      activeNode,
      attributes,
      availableCommands,
      path,
    };
  }

  /**
   * Calculates coordinates relative to the editor container.
   * Uses structural node detection (e.g. Table Cells) for perfect alignment.
   */
  private calculateCoords(view: EditorView, type: MenuType) {
    const { state } = view;
    const { from, to, empty } = state.selection;
    const selection = state.selection as any;

    try {
      const editorRect = view.dom.getBoundingClientRect();
      const containerScrollTop = view.dom.scrollTop;
      const containerScrollLeft = view.dom.scrollLeft;

      // Cell selections should anchor to the selected cell rectangle.
      // Regular caret/text selections inside a cell should anchor to the actual selection.
      const anchorCellPos = selection.anchorCell || selection.$anchorCell?.pos;
      const headCellPos = selection.headCell || selection.$headCell?.pos;
      const isCellSelection = Number.isInteger(anchorCellPos) && Number.isInteger(headCellPos);

      if (isCellSelection) {
        const anchorCellDom = view.nodeDOM(anchorCellPos) as HTMLElement | null;
        const headCellDom = view.nodeDOM(headCellPos) as HTMLElement | null;

        if (anchorCellDom && headCellDom) {
          const anchorRect = anchorCellDom.getBoundingClientRect();
          const headRect = headCellDom.getBoundingClientRect();
          return {
            top: Math.min(anchorRect.top, headRect.top) - editorRect.top + containerScrollTop,
            left: Math.min(anchorRect.left, headRect.left) - editorRect.left + containerScrollLeft,
            bottom:
              Math.max(anchorRect.bottom, headRect.bottom) - editorRect.top + containerScrollTop,
            right:
              Math.max(anchorRect.right, headRect.right) -
              editorRect.left +
              containerScrollLeft,
          };
        }
      }

      // Standard Fallback: Use DOM Range for standard text selections
      if (type === "bubble" && !empty) {
        const range = document.createRange();
        const start = view.domAtPos(from);
        const end = view.domAtPos(to);

        if (start.node && end.node) {
          range.setStart(start.node, start.offset);
          range.setEnd(end.node, end.offset);
          const rect = range.getBoundingClientRect();

          if (rect.width > 0) {
            return {
              top: rect.top - editorRect.top + containerScrollTop,
              left: rect.left - editorRect.left + containerScrollLeft,
              bottom: rect.bottom - editorRect.top + containerScrollTop,
              right: rect.right - editorRect.left + containerScrollLeft,
            };
          }
        }

        const startCoords = view.coordsAtPos(from);
        const endCoords = view.coordsAtPos(to);
        return {
          top: Math.min(startCoords.top, endCoords.top) - editorRect.top + containerScrollTop,
          left: Math.min(startCoords.left, endCoords.left) - editorRect.left + containerScrollLeft,
          bottom:
            Math.max(startCoords.bottom, endCoords.bottom) - editorRect.top + containerScrollTop,
          right:
            Math.max(startCoords.right, endCoords.right) - editorRect.left + containerScrollLeft,
        };
      } else {
        const coords = view.coordsAtPos(from);
        return {
          top: coords.top - editorRect.top + containerScrollTop,
          left: coords.left - editorRect.left + containerScrollLeft,
          bottom: coords.bottom - editorRect.top + containerScrollTop,
          right: coords.right - editorRect.left + containerScrollLeft,
        };
      }
    } catch {
      return null;
    }
  }
}

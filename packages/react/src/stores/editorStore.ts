import { create } from "zustand";
import type { ArkpadEditorAPI } from "@arkpad/core";
import type { Node } from "prosemirror-model";

interface EditorStoreHandlers {
  selection: () => void;
  transaction: () => void;
}

interface EditorStore {
  editor: ArkpadEditorAPI | null;
  selectedNodePos: number;
  selectedNode: Node | null;
  documentVersion: number;
  _handlers: EditorStoreHandlers | null;

  init: (editor: ArkpadEditorAPI) => void;
  destroy: () => void;
  setEditor: (editor: ArkpadEditorAPI | null) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  editor: null,
  selectedNodePos: -1,
  selectedNode: null,
  documentVersion: 0,
  _handlers: null,

  init: (editor: ArkpadEditorAPI) => {
    const handleSelection = () => {
      const selectedNode = editor.selectionService.getSelectedNode();
      const state = editor.getState();
      
      let pos = -1;
      if (selectedNode) {
        state.doc.descendants((node: Node, p: number) => {
          if (node === selectedNode) {
            pos = p;
            return false;
          }
          return true;
        });
      }

      set({ selectedNodePos: pos, selectedNode });
    };

    const handleUpdate = () => {
      set((s) => ({ documentVersion: s.documentVersion + 1 }));
    };

    editor.events.on("selectionUpdate", handleSelection);
    editor.events.on("update", handleUpdate);

    set({
      editor,
      documentVersion: 1,
      _handlers: { selection: handleSelection, transaction: handleUpdate },
    });
  },

  destroy: () => {
    const { editor: ed, _handlers: h } = get();
    if (ed && h) {
      ed.events.off("selectionUpdate", h.selection);
      ed.events.off("update", h.transaction);
    }
    set({
      editor: null,
      selectedNodePos: -1,
      selectedNode: null,
      documentVersion: 0,
      _handlers: null,
    });
  },

  setEditor: (editor) => set({ editor }),
}));

export function useSelectedNodePos() {
  return useEditorStore((s) => s.selectedNodePos);
}

export function useDocumentVersion() {
  return useEditorStore((s) => s.documentVersion);
}

export function useEditorStoreInit() {
  const init = useEditorStore((s) => s.init);
  const destroy = useEditorStore((s) => s.destroy);
  const editor = useEditorStore((s) => s.editor);
  return { init, destroy, editor };
}

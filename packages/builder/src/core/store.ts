import { createStore } from "zustand";
import { LayoutJSON, Row, Column, Block, BlockProperties } from "./types";
import { blockRegistry } from "./registry";

// Unique ID Generator
export const generateId = () => Math.random().toString(36).substring(2, 9);

export interface BuilderState {
  layout: LayoutJSON;
  selectedBlockId: string | null;
  activeDragId: string | null;
  
  // History State
  past: LayoutJSON[];
  future: LayoutJSON[];
  
  selectBlock: (blockId: string | null) => void;
  setActiveDragId: (id: string | null) => void;
  
  // Core Actions
  addRow: () => void;
  removeRow: (rowId: string) => void;
  addColumn: (rowId: string) => void;
  removeColumn: (colId: string) => void;
  setColumnWidth: (colId: string, width: number) => void;
  addBlock: (colId: string, blockType: string) => void;
  removeBlock: (blockId: string) => void;
  updateBlockProperties: (blockId: string, properties: BlockProperties) => void;
  moveBlock: (activeId: string, overId: string) => void;
  duplicateBlock: (blockId: string) => void;
  setLayout: (layout: LayoutJSON) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
}

// Helper to push history states cleanly
const updateLayout = (
  set: any,
  get: any,
  updater: (layout: LayoutJSON) => LayoutJSON
) => {
  const state = get();
  const nextLayout = updater(state.layout);
  
  // Skip history state pushing if layout is identical
  if (JSON.stringify(state.layout) === JSON.stringify(nextLayout)) return;
  
  set({
    past: [...state.past.slice(-49), state.layout],
    future: [],
    layout: nextLayout
  });
};

export const createBuilderStore = (initialLayout?: LayoutJSON) => {
  return createStore<BuilderState>((set, get) => ({
    layout: initialLayout || { rows: [] },
    selectedBlockId: null,
    activeDragId: null,
    
    // History initial state
    past: [],
    future: [],

    selectBlock: (blockId) => set({ selectedBlockId: blockId }),
    setActiveDragId: (id) => set({ activeDragId: id }),

    addRow: () => {
      updateLayout(set, get, (layout) => {
        const newRow: Row = {
          id: `row-${generateId()}`,
          columns: [
            {
              id: `col-${generateId()}`,
              width: 12,
              blocks: []
            }
          ]
        };
        return {
          ...layout,
          rows: [...layout.rows, newRow]
        };
      });
    },

    removeRow: (rowId) => {
      updateLayout(set, get, (layout) => ({
        ...layout,
        rows: layout.rows.filter((row) => row.id !== rowId)
      }));
      set({ selectedBlockId: null });
    },

    addColumn: (rowId) => {
      updateLayout(set, get, (layout) => {
        const rows = layout.rows.map((row) => {
          if (row.id !== rowId) return row;

          const count = row.columns.length + 1;
          const targetWidth = Math.floor(12 / count) || 1;

          const updatedColumns = row.columns.map((col) => ({
            ...col,
            width: targetWidth
          }));

          const newCol: Column = {
            id: `col-${generateId()}`,
            width: targetWidth,
            blocks: []
          };

          return {
            ...row,
            columns: [...updatedColumns, newCol]
          };
        });

        return { ...layout, rows };
      });
    },

    removeColumn: (colId) => {
      updateLayout(set, get, (layout) => {
        const rows = layout.rows
          .map((row) => {
            const hasCol = row.columns.some((col) => col.id === colId);
            if (!hasCol) return row;

            const remainingCols = row.columns.filter((col) => col.id !== colId);
            if (remainingCols.length === 0) return null; // Remove row completely if empty

            const targetWidth = Math.floor(12 / remainingCols.length) || 1;
            const updatedColumns = remainingCols.map((col) => ({
              ...col,
              width: targetWidth
            }));

            return {
              ...row,
              columns: updatedColumns
            };
          })
          .filter((row): row is Row => row !== null);

        return { ...layout, rows };
      });
      set({ selectedBlockId: null });
    },

    setColumnWidth: (colId, width) => {
      updateLayout(set, get, (layout) => {
        const rows = layout.rows.map((row) => {
          const hasCol = row.columns.some((col) => col.id === colId);
          if (!hasCol) return row;

          const updatedColumns = row.columns.map((col) => {
            if (col.id === colId) {
              return { ...col, width };
            }
            return col;
          });

          return { ...row, columns: updatedColumns };
        });
        return { ...layout, rows };
      });
    },

    addBlock: (colId, blockType) => {
      const config = blockRegistry.get(blockType);
      if (!config) {
        console.error(`Attempted to add unregistered block type: "${blockType}"`);
        return;
      }

      const newBlock: Block = {
        id: `block-${generateId()}`,
        type: blockType,
        properties: { ...config.defaultProperties }
      };

      updateLayout(set, get, (layout) => {
        const rows = layout.rows.map((row) => {
          const columns = row.columns.map((col) => {
            if (col.id !== colId) return col;
            return {
              ...col,
              blocks: [...col.blocks, newBlock]
            };
          });
          return { ...row, columns };
        });

        return { ...layout, rows };
      });
      
      set({ selectedBlockId: newBlock.id }); // Auto-select added block
    },

    removeBlock: (blockId) => {
      updateLayout(set, get, (layout) => {
        const rows = layout.rows.map((row) => {
          const columns = row.columns.map((col) => ({
            ...col,
            blocks: col.blocks.filter((b) => b.id !== blockId)
          }));
          return { ...row, columns };
        });

        return { ...layout, rows };
      });

      set((state) => ({
        selectedBlockId: state.selectedBlockId === blockId ? null : state.selectedBlockId
      }));
    },

    updateBlockProperties: (blockId, properties) => {
      updateLayout(set, get, (layout) => {
        const rows = layout.rows.map((row) => {
          const columns = row.columns.map((col) => {
            const hasBlock = col.blocks.some((b) => b.id === blockId);
            if (!hasBlock) return col;

            const blocks = col.blocks.map((b) => {
              if (b.id !== blockId) return b;
              return {
                ...b,
                properties: { ...b.properties, ...properties }
              };
            });

            return { ...col, blocks };
          });
          return { ...row, columns };
        });

        return { ...layout, rows };
      });
    },

    moveBlock: (activeId, overId) => {
      if (activeId === overId) return;

      updateLayout(set, get, (layout) => {
        let activeBlock: Block | null = null;

        // 1. Find and extract active block
        layout.rows.forEach((row) => {
          row.columns.forEach((col) => {
            const found = col.blocks.find((b) => b.id === activeId);
            if (found) {
              activeBlock = found;
            }
          });
        });

        if (!activeBlock) return layout;

        // 2. Filter out active block
        const rowsWithoutActive = layout.rows.map((row) => {
          const columns = row.columns.map((col) => ({
            ...col,
            blocks: col.blocks.filter((b) => b.id !== activeId)
          }));
          return { ...row, columns };
        });

        // 3. Insert active block into target column or block slot
        const rowsWithInserted = rowsWithoutActive.map((row) => {
          const columns = row.columns.map((col) => {
            const overBlockIndex = col.blocks.findIndex((b) => b.id === overId);

            if (overBlockIndex !== -1) {
              const newBlocks = [...col.blocks];
              newBlocks.splice(overBlockIndex, 0, activeBlock!);
              return { ...col, blocks: newBlocks };
            }

            if (col.id === overId) {
              return { ...col, blocks: [...col.blocks, activeBlock!] };
            }

            return col;
          });
          return { ...row, columns };
        });

        return { ...layout, rows: rowsWithInserted };
      });
    },

    duplicateBlock: (blockId) => {
      let newBlockId = "";
      updateLayout(set, get, (layout) => {
        let blockToDuplicate: Block | null = null;
        let targetColId: string | null = null;

        // Locate block and its column
        layout.rows.forEach((row) => {
          row.columns.forEach((col) => {
            const found = col.blocks.find((b) => b.id === blockId);
            if (found) {
              blockToDuplicate = found;
              targetColId = col.id;
            }
          });
        });

        if (!blockToDuplicate || !targetColId) return layout;

        const targetBlock = blockToDuplicate as Block;
        newBlockId = `block-${generateId()}`;
        const clonedBlock: Block = {
          id: newBlockId,
          type: targetBlock.type,
          properties: JSON.parse(JSON.stringify(targetBlock.properties))
        };

        const rows = layout.rows.map((row) => {
          const columns = row.columns.map((col) => {
            if (col.id !== targetColId) return col;
            
            const index = col.blocks.findIndex((b) => b.id === blockId);
            const newBlocks = [...col.blocks];
            newBlocks.splice(index + 1, 0, clonedBlock);
            
            return {
              ...col,
              blocks: newBlocks
            };
          });
          return { ...row, columns };
        });

        return { ...layout, rows };
      });

      if (newBlockId) {
        set({ selectedBlockId: newBlockId });
      }
    },

    setLayout: (layout) => {
      updateLayout(set, get, () => layout);
    },
    
    // History Actions
    undo: () => {
      const { past, layout, future } = get();
      if (past.length === 0) return;
      
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      
      set({
        past: newPast,
        layout: previous,
        future: [layout, ...future],
        selectedBlockId: null // Clear selection on undo
      });
    },
    
    redo: () => {
      const { past, layout, future } = get();
      if (future.length === 0) return;
      
      const next = future[0];
      const newFuture = future.slice(1);
      
      set({
        past: [...past, layout],
        layout: next,
        future: newFuture,
        selectedBlockId: null // Clear selection on redo
      });
    }
  }));
};

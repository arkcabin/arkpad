import React, { createContext, useContext, useRef, useState } from "react";
import { useStore } from "zustand";
import { LayoutJSON, Row, Column, Block } from "./types";
import { blockRegistry } from "./registry";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, FileEdit } from "lucide-react";
import {
  generateId,
  BuilderState,
  createBuilderStore
} from "./store";

// Re-export store types and helpers for backward compatibility
export { generateId };
export type { BuilderState };

type BuilderStore = ReturnType<typeof createBuilderStore>;
const BuilderStoreContext = createContext<BuilderStore | null>(null);

export const BuilderProvider: React.FC<{
  children: React.ReactNode;
  initialLayout?: LayoutJSON;
}> = ({ children, initialLayout }) => {
  const storeRef = useRef<BuilderStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createBuilderStore(initialLayout);
  }

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveDragId(id);
    storeRef.current?.getState().setActiveDragId(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    storeRef.current?.getState().setActiveDragId(null);

    if (!over || !storeRef.current) return;

    const { moveBlock, addBlock, addRow, addColumn, layout } = storeRef.current.getState();

    // 1. Dragging from Palette
    if (String(active.id).startsWith("palette-")) {
      const blockType = String(active.id).replace("palette-", "");

      // Handle drop on empty canvas placeholder
      if (over.id === "canvas-empty-zone") {
        if (blockType === "layout-row" || blockType === "layout-column") {
          addRow();
        } else {
          // Auto-initialize row with dropped widget
          const config = blockRegistry.get(blockType);
          if (config) {
            const newBlock: Block = {
              id: `block-${generateId()}`,
              type: blockType,
              properties: { ...config.defaultProperties }
            };
            const newCol: Column = {
              id: `col-${generateId()}`,
              width: 12,
              blocks: [newBlock]
            };
            const newRow: Row = {
              id: `row-${generateId()}`,
              columns: [newCol]
            };
            storeRef.current.setState((state) => ({
              layout: {
                ...state.layout,
                rows: [...state.layout.rows, newRow]
              },
              selectedBlockId: newBlock.id
            }));
          }
        }
        return;
      }

      // Case A: Dragging a Section Row (insert at bottom for now)
      if (blockType === "layout-row") {
        addRow();
        return;
      }

      // Case B: Dragging a Grid Column
      if (blockType === "layout-column") {
        let targetRowId: string | null = null;
        // Find which row we dropped over (by row ID or col ID or block ID)
        layout.rows.forEach((row) => {
          if (row.id === over.id) {
            targetRowId = row.id;
          }
          row.columns.forEach((col) => {
            if (col.id === over.id) {
              targetRowId = row.id;
            }
            if (col.blocks.some((b) => b.id === over.id)) {
              targetRowId = row.id;
            }
          });
        });

        const firstRow = layout.rows[0];
        if (targetRowId) {
          addColumn(targetRowId);
        } else if (firstRow) {
          addColumn(firstRow.id);
        }
        return;
      }

      // Case C: Standard content blocks
      let targetColId = String(over.id);

      // Find if dropped over a block instead of a column
      layout.rows.forEach((row) => {
        row.columns.forEach((col) => {
          if (col.blocks.some((b) => b.id === over.id)) {
            targetColId = col.id;
          }
        });
      });

      addBlock(targetColId, blockType);
      return;
    }

    // 2. Reordering within Canvas
    moveBlock(active.id as string, over.id as string);
  };

  return (
    <BuilderStoreContext.Provider value={storeRef.current}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeDragId ? (
            activeDragId.startsWith("palette-") ? (
              <div className="w-56 p-3 rounded border border-emerald-500/60 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-2xl flex items-center gap-3 text-neutral-850 dark:text-neutral-200 pointer-events-none select-none z-[9999]">
                <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Plus className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 block">
                    Create New Block
                  </span>
                  <p className="text-[10px] text-neutral-550 dark:text-neutral-400 font-semibold truncate capitalize mt-0.5">
                    {activeDragId.replace("palette-", "").replace("-", " ")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-56 p-3 rounded border border-neutral-300 dark:border-neutral-850 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm shadow-2xl flex items-center gap-3 text-neutral-850 dark:text-neutral-200 pointer-events-none select-none z-[9999]">
                <div className="p-1.5 rounded bg-neutral-100 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800">
                  <FileEdit className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 block">
                    Reorder Layout
                  </span>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold truncate mt-0.5">
                    Moving component...
                  </p>
                </div>
              </div>
            )
          ) : null}
        </DragOverlay>
      </DndContext>
    </BuilderStoreContext.Provider>
  );
};

// 3. Custom hook with optional selector mapping (optimizing re-renders)
export function useBuilder(): BuilderState;
export function useBuilder<T>(selector: (state: BuilderState) => T): T;
export function useBuilder<T>(selector?: (state: BuilderState) => T) {
  const store = useContext(BuilderStoreContext);
  if (!store) {
    throw new Error("useBuilder must be used within a BuilderProvider");
  }

  // If a selector is provided, subscribe to that part of state. Otherwise, return full store.
  if (selector) {
    return useStore(store, selector);
  }

  return useStore(store);
}

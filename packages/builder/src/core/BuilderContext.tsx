import React, { createContext, useContext, useRef, useState } from "react";
import { useStore } from "zustand";
import { PageBlock, PageConfig, NormalizedPageConfig } from "./types";
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
  DragOverlay,
  pointerWithin,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, FileEdit } from "lucide-react";
import {
  generateId,
  BuilderState,
  createBuilderStore,
} from "./store";

// Re-export store types and helpers for backward compatibility
export { generateId };
export type { BuilderState };

type BuilderStore = ReturnType<typeof createBuilderStore>;
const BuilderStoreContext = createContext<BuilderStore | null>(null);

// Helper to check if a target block resides inside a form block recursively
export function isBlockInsideForm(
  blocks: Record<string, PageBlock>,
  targetId: string,
  isInside: boolean = false
): boolean {
  const block = blocks[targetId];
  if (!block) return false;

  if (block.type === "form") return true;
  if (isInside) return true;

  if (block.parentId) {
    return isBlockInsideForm(blocks, block.parentId, false);
  }

  return false;
}

export const BuilderProvider: React.FC<{
  children: React.ReactNode;
  initialConfig?: PageConfig;
}> = ({ children, initialConfig }) => {
  const storeRef = useRef<BuilderStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createBuilderStore(initialConfig);
  }

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveDragId(id);

    // If dragging from palette
    if (id.startsWith("palette-")) {
      setActiveDragType(id.replace("palette-", ""));
    } else {
      const state = storeRef.current?.getState();
      if (state && state.pageConfig?.blocks[id]) {
        setActiveDragType(state.pageConfig.blocks[id].type);
      }
    }

    storeRef.current?.getState().setDraggedBlockId(id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);
    setActiveDragType(null);
    storeRef.current?.getState().setDraggedBlockId(null);

    if (!over || !storeRef.current) return;

    const { pageConfig, addBlock, moveBlock } = storeRef.current.getState();
    if (!pageConfig) return;

    const blocks = pageConfig.blocks;
    const targetBlock = blocks[over.id as string];
    const targetBlockType = targetBlock?.type;

    // Check if target is inside a form
    const isTargetInsideForm =
      over.id !== "root-container" &&
      over.id !== "root-canvas" &&
      isBlockInsideForm(blocks, over.id as string);

    // --- CASE 1: Dragging from Palette (New Block) ---
    if (String(active.id).startsWith("palette-")) {
      const blockType = String(active.id).replace("palette-", "");
      const isFormField = blockType === "form-field";

      // 1. Form fields cannot accept children
      if (targetBlockType === "form-field") {
        console.warn("Nesting Violation: Form fields cannot accept children.");
        return;
      }

      // 2. Form fields can ONLY be dropped into Form blocks (or form descendants)
      if (isFormField && !isTargetInsideForm) {
        console.warn("Nesting Violation: Form fields must be nested inside a Form block.");
        return;
      }

      // 3. Forms cannot be nested
      if (blockType === "form" && isTargetInsideForm) {
        console.warn("Nesting Violation: Nested forms are not allowed.");
        return;
      }

      // 4. Non-Form fields inside form check (only button, header, container, layout, text are allowed in form)
      if (!isFormField && targetBlockType === "form") {
        const isAllowedInForm = [
          "button",
          "header",
          "container",
          "layout",
          "text",
          "content",
          "text-editor",
          "image",
        ].includes(blockType);

        if (!isAllowedInForm) {
          console.warn(`Nesting Violation: Block of type "${blockType}" is not allowed directly inside a Form.`);
          return;
        }
      }

      // Initialize default properties from registry or fallback
      const definition = blockRegistry.get(blockType);
      const newBlock: PageBlock = {
        id: `${blockType}-${generateId()}`,
        type: blockType,
        enabled: true,
        children: [],
        props: definition ? { ...definition.defaultProps } : {},
        styles: definition ? { ...definition.defaultStyles } : {},
      };

      let parentId: string | undefined = undefined;
      if (over.id === "root-container" || over.id === "root-canvas") {
        parentId = undefined;
      } else {
        // If dropping over a container-like element, set it as parent
        // If dropping over a leaf, set its parent as our parent
        const isContainerLike = ["container", "layout", "form"].includes(targetBlockType || "");
        parentId = isContainerLike ? (over.id as string) : targetBlock?.parentId;
      }

      addBlock(newBlock, parentId);
      return;
    }

    // --- CASE 2: Reordering Existing Blocks ---
    const activeId = active.id as string;
    const activeBlock = blocks[activeId];
    if (!activeBlock) return;

    const isFormField = activeBlock.type === "form-field";

    // 1. Form fields cannot accept children
    if (targetBlockType === "form-field") {
      return;
    }

    // 2. Forms cannot be nested
    if (activeBlock.type === "form" && isTargetInsideForm) {
      console.warn("Nesting Violation: Forms cannot be nested.");
      return;
    }

    // 3. Form fields can only reside inside a form
    if (isFormField && !isTargetInsideForm) {
      console.warn("Nesting Violation: Form fields must be nested inside a Form block.");
      return;
    }

    // Determine position/relationship (before, after, inside)
    let position: "before" | "after" | "inside" = "inside";
    let overId = over.id as string;

    if (overId === "root-canvas" || overId === "root-container") {
      overId = "root-canvas";
      position = "inside";
    } else {
      const isContainerLike = ["container", "layout", "form"].includes(targetBlockType || "");
      if (isContainerLike) {
        position = "inside";
      } else {
        // If dropping over a leaf, insert "after" by default or match sorting context
        position = "after";
      }
    }

    moveBlock(activeId, overId, position);
  };

  return (
    <BuilderStoreContext.Provider value={storeRef.current}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeDragId ? (
            activeDragId.startsWith("palette-") ? (
              <div className="w-56 p-3 rounded border border-emerald-500 bg-black text-white shadow-2xl flex items-center gap-3 pointer-events-none select-none z-[9999] border-solid rounded-none">
                <div className="p-1.5 rounded-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Plus className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-emerald-400 block">
                    Create New Block
                  </span>
                  <p className="text-[10px] text-neutral-400 font-semibold truncate capitalize mt-0.5">
                    {(activeDragType || "").replace("-", " ")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-56 p-3 rounded border border-neutral-800 bg-neutral-950 text-neutral-200 shadow-2xl flex items-center gap-3 pointer-events-none select-none z-[9999] border-solid rounded-none">
                <div className="p-1.5 rounded-none bg-neutral-900 text-neutral-400 border border-neutral-800">
                  <FileEdit className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold tracking-wider uppercase text-neutral-500 block">
                    Reorder Layout
                  </span>
                  <p className="text-[10px] text-neutral-450 font-semibold truncate mt-0.5">
                    Moving {(activeDragType || "component")}...
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

// Custom hook with optional selector mapping
export function useBuilder(): BuilderState;
export function useBuilder<T>(selector: (state: BuilderState) => T): T;
export function useBuilder<T>(selector?: (state: BuilderState) => T) {
  const store = useContext(BuilderStoreContext);
  if (!store) {
    throw new Error("useBuilder must be used within a BuilderProvider");
  }

  if (selector) {
    return useStore(store, selector);
  }

  return useStore(store);
}

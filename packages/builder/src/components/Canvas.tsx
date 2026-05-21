import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { LayoutGrid, Plus } from "lucide-react";
import { useBuilder } from "../core/BuilderContext";
import { BlockRenderer } from "./BlockRenderer";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

const EmptyCanvasZone: React.FC<{ onAddContainer: () => void }> = ({ onAddContainer }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "root-canvas",
  });

  const activeDragId = useBuilder((s) => s.draggedBlockId);

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex-1 flex flex-col items-center justify-center border transition-all duration-155 min-h-[400px] text-center p-8 rounded-none border-solid",
        isOver
          ? "border-neutral-900 bg-neutral-50 dark:border-neutral-200 dark:bg-neutral-900/40"
          : activeDragId
            ? "border-neutral-400 dark:border-neutral-600 bg-neutral-50/10 dark:bg-neutral-900/10 border-dashed animate-pulse"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 border-dashed"
      )}
    >
      <LayoutGrid
        className={clsx(
          "w-8 h-8 mb-4 transition-colors duration-155",
          isOver ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-600"
        )}
      />
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
        Empty Canvas
      </h3>
      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs leading-relaxed px-4">
        Drag a block from the palette sidebar or click the button below to add a starting container.
      </p>
      <button
        onClick={onAddContainer}
        className="mt-6 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-black font-semibold text-[10px] uppercase tracking-wider border border-neutral-800 dark:border-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm rounded-none"
      >
        <Plus className="w-3.5 h-3.5" />
        Add Container
      </button>
    </div>
  );
};

export const Canvas: React.FC = () => {
  const pageConfig = useBuilder((s) => s.pageConfig);
  const rootIds = pageConfig?.rootIds || [];
  const addBlock = useBuilder((s) => s.addBlock);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const activeDragId = useBuilder((s) => s.draggedBlockId);

  const { setNodeRef: setCanvasDroppableRef, isOver } = useDroppable({
    id: "root-canvas",
  });

  const handleAddContainer = () => {
    addBlock(
      {
        id: `container-${Math.random().toString(36).substring(2, 9)}`,
        type: "container",
        enabled: true,
        children: [],
        props: { layout: "flex", htmlTag: "div" },
        styles: { className: "w-full min-h-[100px] p-4 flex flex-col gap-4" },
      },
      undefined
    );
  };

  return (
    <div
      ref={setCanvasDroppableRef}
      className={clsx(
        "flex-1 bg-neutral-50 dark:bg-neutral-950 overflow-y-auto p-8 border-r border-neutral-200 dark:border-neutral-800 transition-colors duration-155 flex flex-col relative",
        isOver && rootIds.length > 0 && "bg-neutral-100/50 dark:bg-neutral-900/10"
      )}
      onClick={() => selectBlock(null)}
      id="root-canvas"
    >
      <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col">
        {rootIds.length === 0 ? (
          <EmptyCanvasZone onAddContainer={handleAddContainer} />
        ) : (
          <div className="space-y-4 pb-32">
            <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
              {rootIds.map((id, index) => (
                <BlockRenderer
                  key={id}
                  blockId={id}
                  index={index}
                  parentId="root-canvas"
                />
              ))}
            </SortableContext>

            {/* Drop Indicator when dragging to canvas root */}
            {isOver && activeDragId && (
              <div className="h-8 border-2 border-dashed border-neutral-400 dark:border-neutral-600 flex items-center justify-center text-[9px] uppercase tracking-wider text-neutral-400 font-bold animate-pulse">
                Drop here to append at root level
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

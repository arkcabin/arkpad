import React from "react";
import {
  SortableContext,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { Plus, Trash2, LayoutGrid } from "lucide-react";
import { useBuilder } from "../core/BuilderContext";
import { SortableBlock } from "./SortableBlock";
import { blockRegistry } from "../core/registry";
import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";

// Mapping 12-column grid spans
const getColSpanClass = (width: number) => {
  switch (width) {
    case 1: return "col-span-1";
    case 2: return "col-span-2";
    case 3: return "col-span-3";
    case 4: return "col-span-4";
    case 5: return "col-span-5";
    case 6: return "col-span-6";
    case 7: return "col-span-7";
    case 8: return "col-span-8";
    case 9: return "col-span-9";
    case 10: return "col-span-10";
    case 11: return "col-span-11";
    case 12: return "col-span-12";
    default: return "col-span-12";
  }
};

interface DroppableColumnProps {
  col: any;
  rowId: string;
  removeColumn: (colId: string) => void;
  rowColumnsLength: number;
  allBlocks: any[];
  addBlock: (colId: string, blockType: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  col,
  rowId,
  removeColumn,
  rowColumnsLength,
  allBlocks,
  addBlock
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: col.id,
  });

  const activeDragId = useBuilder((s) => s.activeDragId);

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex flex-col border p-3 min-h-[140px] transition-all duration-300 rounded-lg",
        isOver
          ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-[inset_0_0_12px_rgba(16,185,129,0.08)] scale-[0.99] border-solid"
          : activeDragId && !activeDragId.includes("layout-row")
            ? "border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.01] border-dashed"
            : "border-neutral-200 dark:border-neutral-850 bg-neutral-50/20 dark:bg-neutral-900/5 border-dashed",
        getColSpanClass(col.width)
      )}
    >
      {/* Column controls */}
      <div className="flex items-center justify-between mb-2 select-none">
        <span className="text-[9px] font-semibold text-neutral-450 dark:text-neutral-600 uppercase tracking-wide">
          Column ({col.width}/12)
        </span>
        {rowColumnsLength > 1 && (
          <button
            onClick={() => removeColumn(col.id)}
            className="text-[9px] text-neutral-450 hover:text-red-500 dark:text-neutral-500 dark:hover:text-red-400 hover:underline"
          >
            Remove Column
          </button>
        )}
      </div>

      {/* Sortable block list in column */}
      <div className="flex-1 space-y-3 relative">
        <SortableContext
          items={col.blocks.map((b: any) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {col.blocks.map((block: any) => (
            <SortableBlock key={block.id} block={block} />
          ))}
        </SortableContext>

        {/* Elementor-like Insertion Guide Line */}
        {isOver && activeDragId && !activeDragId.includes("layout-") && (
          <div className="h-1 bg-emerald-500 rounded my-3 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse transition-all duration-300" />
        )}

        {/* Drop block target container */}
        <div className="pt-2">
          <div className="flex items-center gap-1 flex-wrap">
            {allBlocks.map((blockDef) => (
              <button
                key={blockDef.type}
                onClick={(e) => {
                  e.stopPropagation();
                  addBlock(col.id, blockDef.type);
                }}
                className="px-2 py-1 text-[9px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-350 dark:hover:border-neutral-700 transition-colors"
              >
                + {blockDef.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyCanvasZone: React.FC<{ onAddRow: () => void }> = ({ onAddRow }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: "canvas-empty-zone",
  });

  const activeDragId = useBuilder((s) => s.activeDragId);

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex-1 flex flex-col items-center justify-center border rounded-xl transition-all duration-300 min-h-[400px] text-center p-8",
        isOver
          ? "border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 scale-[0.99] shadow-[inset_0_0_16px_rgba(16,185,129,0.08)] border-solid"
          : activeDragId
            ? "border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-500/[0.02] border-dashed animate-pulse"
            : "border-neutral-250 dark:border-neutral-800 bg-neutral-100/30 dark:bg-neutral-900/10 border-dashed"
      )}
    >
      <LayoutGrid className={clsx(
        "w-10 h-10 mb-4 transition-colors duration-200",
        isOver ? "text-emerald-500 animate-pulse" : "text-neutral-400 dark:text-neutral-500"
      )} />
      <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-250">
        Empty Design Workspace
      </h3>
      <p className="text-xs text-neutral-550 dark:text-neutral-500 mt-2 max-w-sm leading-relaxed px-4">
        Drag a <strong className="font-semibold text-neutral-850 dark:text-neutral-200">Section Row</strong> here to start, or click below to initialize your layout grid.
      </p>
      <button
        onClick={onAddRow}
        className="mt-6 px-4 py-2 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black font-semibold text-xs border border-neutral-200 dark:border-neutral-850 hover:border-neutral-350 dark:hover:border-neutral-600 transition-colors flex items-center gap-1.5 shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        Initialize Layout Grid
      </button>
    </div>
  );
};

export const Canvas: React.FC = () => {
  const {
    layout,
    addRow,
    removeRow,
    addColumn,
    removeColumn,
    addBlock,
    selectBlock,
    activeDragId
  } = useBuilder();

  const allBlocks = blockRegistry.getAll();

  return (
    <div 
      className="flex-1 bg-neutral-50 dark:bg-neutral-950 overflow-y-auto p-8 border-r border-neutral-200 dark:border-neutral-800 transition-colors duration-200 flex flex-col"
      onClick={() => selectBlock(null)}
    >
      <div className={clsx("max-w-5xl w-full mx-auto flex-1 flex flex-col", layout.rows.length === 0 ? "" : "space-y-8 pb-32")}>
        {/* Empty Workspace */}
        {layout.rows.length === 0 && (
          <EmptyCanvasZone onAddRow={addRow} />
        )}

        {/* Grid Layout Rows */}
        {layout.rows.map((row) => (
          <div
            key={row.id}
            className={clsx(
              "group/row relative border p-4 pt-8 transition-all duration-300 shadow-sm rounded-lg",
              activeDragId === "palette-layout-column"
                ? "border-amber-500/40 bg-amber-500/[0.01] dark:border-amber-500/30"
                : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/20"
            )}
          >
            {/* Row Management Tools */}
            <div className="absolute top-2 right-3 opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-2 z-10">
              <button
                onClick={() => addColumn(row.id)}
                className="px-2 py-1 text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 hover:dark:text-white border border-neutral-200 dark:border-neutral-700 font-medium transition-colors"
                title="Add column to split grid"
              >
                Split Grid
              </button>
              <button
                onClick={() => removeRow(row.id)}
                className="p-1 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded"
                title="Delete row"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute top-2 left-3 text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold tracking-wider uppercase">
              Section Row
            </div>

            {/* Grid Columns */}
            <div className="grid grid-cols-12 gap-4">
              {row.columns.map((col) => (
                <DroppableColumn
                  key={col.id}
                  col={col}
                  rowId={row.id}
                  removeColumn={removeColumn}
                  rowColumnsLength={row.columns.length}
                  allBlocks={allBlocks}
                  addBlock={addBlock}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Add Row Button at bottom */}
        {layout.rows.length > 0 && (
          <div className="flex justify-center pt-2">
            <button
              onClick={addRow}
              className="px-4 py-2 border border-dashed border-neutral-300 dark:border-neutral-800 hover:border-neutral-450 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-white text-xs flex items-center gap-2 transition-all shadow-sm rounded-none"
            >
              <Plus className="w-4 h-4" />
              Insert Section Row
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

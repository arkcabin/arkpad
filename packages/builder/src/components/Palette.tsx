import React from "react";
import { useBuilder } from "../core/BuilderContext";
import { blockRegistry } from "../core/registry";
import { Plus, LayoutGrid, Columns } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";

interface DraggableBlockItemProps {
  block: any;
  onAdd: () => void;
}

const DraggableBlockItem: React.FC<DraggableBlockItemProps> = ({ block, onAdd }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.type}`,
  });

  const IconComponent = block.icon;

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onAdd}
      className={`w-full group flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-950/40 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-350 dark:hover:border-neutral-700 transition-all duration-150 cursor-grab active:cursor-grabbing select-none text-left focus:outline-none ${
        isDragging ? "opacity-40 ring-1 ring-emerald-500/50" : ""
      }`}
    >
      {IconComponent && (
        <div className="p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-150">
          <IconComponent className="w-3.5 h-3.5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-neutral-950 dark:text-white truncate">
            {block.name}
          </span>
          <Plus className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors duration-150 opacity-0 group-hover:opacity-100" />
        </div>
        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-normal">
          {block.description}
        </p>
      </div>
    </button>
  );
};

export const Palette: React.FC = () => {
  const { layout, addBlock, addRow, addColumn, selectedBlockId } = useBuilder();
  const allBlocks = blockRegistry.getAll();

  const handleAddBlock = (blockType: string) => {
    if (blockType === "layout-row") {
      addRow();
      return;
    }

    if (blockType === "layout-column") {
      let targetRowId: string | null = null;
      if (selectedBlockId) {
        layout.rows.forEach((row) => {
          if (row.columns.some((col) => col.blocks.some((b) => b.id === selectedBlockId))) {
            targetRowId = row.id;
          }
        });
      }
      const firstRow = layout.rows[0];
      if (!targetRowId && firstRow) {
        targetRowId = firstRow.id;
      }
      if (targetRowId) {
        addColumn(targetRowId);
      }
      return;
    }

    let targetColId: string | null = null;

    // 1. If a block is currently selected, find its parent column to append to
    if (selectedBlockId) {
      layout.rows.forEach((row) => {
        row.columns.forEach((col) => {
          if (col.blocks.some((b) => b.id === selectedBlockId)) {
            targetColId = col.id;
          }
        });
      });
    }

    // 2. If no block is selected but layout exists, use the first column of the first row
    const firstRow = layout.rows[0];
    if (!targetColId && firstRow) {
      const firstCol = firstRow.columns[0];
      if (firstCol) {
        targetColId = firstCol.id;
      }
    }

    // 3. If layout is empty, create a row first
    if (!targetColId) {
      addRow();
      return;
    }

    addBlock(targetColId, blockType);
  };

  // Group blocks by logical category
  const textBlocks = allBlocks.filter(b => b.type === "rich-text");
  const widgetBlocks = allBlocks.filter(b => b.type !== "rich-text");

  // Custom layout block options
  const layoutBlocks = [
    {
      type: "layout-row",
      name: "Section Row",
      description: "Create a horizontal canvas grid section to drop columns and widgets into.",
      icon: LayoutGrid
    },
    {
      type: "layout-column",
      name: "Split Column",
      description: "Add a new column into a row to split components horizontally.",
      icon: Columns
    }
  ];

  return (
    <div className="w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full text-neutral-800 dark:text-neutral-200 transition-colors duration-200">
      {/* Top Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <h2 className="text-xs font-semibold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
          Component Library
        </h2>
      </div>

      {/* Palette items list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* LAYOUT GRID SECTION */}
        <div className="space-y-2">
          <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
            Layout Grid
          </span>
          <div className="space-y-2">
            {layoutBlocks.map((block) => (
              <DraggableBlockItem
                key={block.type}
                block={block}
                onAdd={() => handleAddBlock(block.type)}
              />
            ))}
          </div>
        </div>

        {/* TEXT SECTION */}
        {textBlocks.length > 0 && (
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
              Typography
            </span>
            <div className="space-y-2">
              {textBlocks.map((block) => (
                <DraggableBlockItem
                  key={block.type}
                  block={block}
                  onAdd={() => handleAddBlock(block.type)}
                />
              ))}
            </div>
          </div>
        )}

        {/* WIDGETS SECTION */}
        {widgetBlocks.length > 0 && (
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
              Metrics & Analytics
            </span>
            <div className="space-y-2">
              {widgetBlocks.map((block) => (
                <DraggableBlockItem
                  key={block.type}
                  block={block}
                  onAdd={() => handleAddBlock(block.type)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-center">
        <p className="text-[10px] text-neutral-500 dark:text-neutral-550 leading-relaxed px-2">
          Drag components directly onto canvas or click to insert
        </p>
      </div>
    </div>
  );
};

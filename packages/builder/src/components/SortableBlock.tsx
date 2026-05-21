import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Copy } from "lucide-react";
import { Block } from "../core/types";
import { blockRegistry } from "../core/registry";
import { useBuilder } from "../core/BuilderContext";
import clsx from "clsx";

interface SortableBlockProps {
  block: Block;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ block }) => {
  const {
    selectedBlockId,
    selectBlock,
    removeBlock,
    updateBlockProperties,
    duplicateBlock
  } = useBuilder();

  const config = blockRegistry.get(block.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: block.id
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1
  };

  const isSelected = selectedBlockId === block.id;

  if (!config) {
    return (
      <div className="p-3 bg-red-950/20 text-red-400 border border-red-900 text-xs">
        Unknown block type: {block.type}
      </div>
    );
  }

  const BlockComponent = config.component;

  const handleUpdateProperties = (props: Record<string, any>) => {
    updateBlockProperties(block.id, props);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(block.id);
      }}
      className={clsx(
        "group relative flex flex-col border transition-all duration-155 bg-white dark:bg-neutral-900 shadow-sm rounded-lg",
        isSelected
          ? "border-blue-500 dark:border-blue-500 ring-1 ring-blue-500"
          : "border-neutral-200 dark:border-neutral-800 hover:border-blue-500/40 dark:hover:border-blue-500/30"
      )}
    >
      {/* GrapesJS-style Floating Label Tag */}
      {isSelected && (
        <div className="absolute -top-[19px] left-0 bg-blue-600 dark:bg-blue-500 text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-t select-none pointer-events-none z-[60] shadow-sm">
          {config.name}
        </div>
      )}

      {/* GrapesJS-style Floating Control Toolbar */}
      {isSelected && (
        <div className="absolute -top-[25px] right-0 flex items-center bg-blue-600 dark:bg-blue-500 text-white rounded-t shadow-md z-[60] overflow-hidden select-none h-6">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="p-1 px-1.5 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors cursor-grab active:cursor-grabbing border-r border-blue-500/30 flex items-center justify-center h-full"
            title="Drag to reorder"
          >
            <GripVertical className="w-3 h-3" />
          </button>
          
          {/* Duplicate Block */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateBlock(block.id);
            }}
            className="p-1 px-1.5 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors border-r border-blue-500/30 flex items-center justify-center h-full cursor-pointer"
            title="Duplicate block"
          >
            <Copy className="w-3 h-3" />
          </button>

          {/* Delete Block */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(block.id);
            }}
            className="p-1 px-1.5 hover:bg-red-650 hover:bg-red-600 transition-colors flex items-center justify-center h-full cursor-pointer"
            title="Delete block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Embedded Block component (Clean canvas, no static header bars) */}
      <div className="p-4 flex-1">
        <BlockComponent
          id={block.id}
          properties={block.properties}
          updateProperties={handleUpdateProperties}
          isEditing={true}
        />
      </div>
    </div>
  );
};

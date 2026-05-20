import React, { useState } from "react";
import { useBuilder } from "../core/BuilderContext";
import { blockRegistry } from "../core/registry";
import { exportToJSON, exportToMarkdown } from "../core/export";
import {
  FileJson,
  FileText,
  Clipboard,
  ClipboardCheck,
  X,
  Layers,
  Settings,
  Trash2,
  LayoutGrid,
  Paintbrush,
  Columns,
  Plus
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";

// Inner component for draggable blocks inside the sidebar
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
      className={clsx(
        "group flex flex-col items-center justify-center p-3 aspect-square bg-[#171c24]/40 hover:bg-[#171c24]/85 border border-[#171c24]/90 text-[#c5cdd6] hover:text-white rounded-lg transition-all duration-150 cursor-grab active:cursor-grabbing select-none text-center focus:outline-none",
        isDragging && "opacity-40 ring-1 ring-blue-500/50"
      )}
    >
      {IconComponent && (
        <IconComponent className="w-5 h-5 mb-1.5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
      )}
      <span className="text-[10px] font-semibold tracking-wide uppercase truncate w-full">
        {block.name}
      </span>
    </button>
  );
};

// Document Tree Layers Panel Component
const LayersPanel: React.FC<{
  layout: any;
  selectedBlockId: string | null;
  selectBlock: (id: string | null) => void;
  removeRow: (id: string) => void;
  removeColumn: (id: string) => void;
  removeBlock: (id: string) => void;
  setActiveTab: (tab: any) => void;
}> = ({
  layout,
  selectedBlockId,
  selectBlock,
  removeRow,
  removeColumn,
  removeBlock,
  setActiveTab
}) => {
  return (
    <div className="space-y-4">
      {/* Root Body Tag (GrapesJS Canvas Wrapper) */}
      <div
        onClick={() => selectBlock(null)}
        className={clsx(
          "flex items-center justify-between p-2 rounded cursor-pointer transition-all border",
          !selectedBlockId
            ? "bg-[#2680eb] border-[#2680eb] text-white font-bold"
            : "bg-[#171c24]/30 border-transparent text-[#c5cdd6] hover:bg-[#171c24]/60 hover:text-white"
        )}
      >
        <span className="text-xs font-bold uppercase tracking-wider">
          Body (Canvas)
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-[#171c24]/60 text-neutral-400 rounded">
          Root
        </span>
      </div>

      {layout.rows.length === 0 ? (
        <p className="text-xs text-neutral-500 text-center py-8">
          No layout sections created yet.
        </p>
      ) : (
        <div className="space-y-2.5 font-sans">
          {layout.rows.map((row: any, rIndex: number) => (
            <div key={row.id} className="border border-[#171c24]/80 rounded-lg p-1.5 bg-[#171c24]/10">
              {/* Row Node */}
              <div className="flex items-center justify-between group/row-item py-0.5 px-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-white">
                  <span className="text-neutral-500">#{rIndex + 1}</span>
                  <span>Section Row</span>
                </div>
                <button
                  onClick={() => removeRow(row.id)}
                  className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-[#171c24]/60 transition-colors"
                  title="Delete Section Row"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Columns Node List */}
              <div className="pl-3.5 mt-1 space-y-2 border-l border-[#171c24] ml-1">
                {row.columns.map((col: any, cIndex: number) => (
                  <div key={col.id} className="space-y-1">
                    <div className="flex items-center justify-between group/col-item py-0.5 px-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-400">
                        <span>Column {cIndex + 1} ({col.width}/12)</span>
                      </div>
                      {row.columns.length > 1 && (
                        <button
                          onClick={() => removeColumn(col.id)}
                          className="p-1 text-neutral-500 hover:text-red-400 rounded hover:bg-[#171c24]/60 transition-colors"
                          title="Delete Column"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Blocks Node List */}
                    <div className="pl-3.5 space-y-1 border-l border-dashed border-[#171c24] ml-1">
                      {col.blocks.length === 0 ? (
                        <span className="text-[9px] text-neutral-600 italic block py-0.5 px-1">
                          Empty grid cell
                        </span>
                      ) : (
                        col.blocks.map((block: any) => {
                          const config = blockRegistry.get(block.type);
                          const isSelected = selectedBlockId === block.id;

                          return (
                            <div
                              key={block.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                selectBlock(block.id);
                                setActiveTab("inspector");
                              }}
                              className={clsx(
                                "flex items-center justify-between group/block-item p-1.5 border transition-all cursor-pointer rounded text-[11px]",
                                isSelected
                                  ? "bg-[#2680eb] border-[#2680eb] text-white font-bold"
                                  : "border-transparent text-[#c5cdd6] hover:bg-[#171c24]/60 hover:text-white"
                              )}
                            >
                              <span className="truncate flex-1 pr-2">
                                {config?.name || block.type}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBlock(block.id);
                                }}
                                className="p-0.5 text-neutral-500 hover:text-red-400 rounded hover:bg-[#171c24]/60 transition-colors opacity-0 group-hover/block-item:opacity-100"
                                title="Delete Block"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const {
    layout,
    selectedBlockId,
    selectBlock,
    updateBlockProperties,
    removeRow,
    removeColumn,
    removeBlock,
    addRow,
    addColumn,
    addBlock
  } = useBuilder();

  const [activeTab, setActiveTab] = useState<"blocks" | "layers" | "inspector" | "settings">("blocks");
  const [exportMode, setExportMode] = useState<"none" | "json" | "markdown">("none");
  const [copied, setCopied] = useState(false);

  const allBlocks = blockRegistry.getAll();

  // Find the currently selected block in the layout tree
  let selectedBlock: any = null;
  if (selectedBlockId) {
    layout.rows.forEach((row) => {
      row.columns.forEach((col) => {
        col.blocks.forEach((block) => {
          if (block.id === selectedBlockId) {
            selectedBlock = block;
          }
        });
      });
    });
  }

  const selectedConfig = selectedBlock ? blockRegistry.get(selectedBlock.type) : null;

  const handleFieldChange = (fieldName: string, value: any) => {
    if (selectedBlockId) {
      updateBlockProperties(selectedBlockId, { [fieldName]: value });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

    // Append to selected block's column
    if (selectedBlockId) {
      layout.rows.forEach((row) => {
        row.columns.forEach((col) => {
          if (col.blocks.some((b) => b.id === selectedBlockId)) {
            targetColId = col.id;
          }
        });
      });
    }

    // Default to first cell
    const firstRow = layout.rows[0];
    if (!targetColId && firstRow) {
      const firstCol = firstRow.columns[0];
      if (firstCol) {
        targetColId = firstCol.id;
      }
    }

    if (!targetColId) {
      addRow();
      return;
    }

    addBlock(targetColId, blockType);
  };

  // Group blocks for blocks palette
  const textBlocks = allBlocks.filter((b) => b.type === "rich-text");
  const widgetBlocks = allBlocks.filter((b) => b.type !== "rich-text");

  const layoutBlocks = [
    {
      type: "layout-row",
      name: "Section Row",
      icon: LayoutGrid
    },
    {
      type: "layout-column",
      name: "Split Column",
      icon: Columns
    }
  ];

  const exportedText =
    exportMode === "json"
      ? exportToJSON(layout)
      : exportMode === "markdown"
      ? exportToMarkdown(layout)
      : "";

  return (
    <div className="w-80 bg-[#1e2530] border-l border-[#171c24] flex flex-col h-full text-[#c5cdd6] select-none shrink-0 font-sans">
      {/* Top Header Tab Switcher */}
      <div className="flex items-center justify-between px-4 bg-[#1e2530] border-b border-[#171c24] shrink-0 h-11">
        <div className="text-[10px] font-bold text-white uppercase tracking-wider">
          {activeTab === "blocks" && "Blocks"}
          {activeTab === "layers" && "Navigator"}
          {activeTab === "inspector" && "Style Manager"}
          {activeTab === "settings" && "Exporter"}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Blocks */}
          <button
            onClick={() => setActiveTab("blocks")}
            className={clsx(
              "p-1.5 rounded transition-all cursor-pointer",
              activeTab === "blocks" ? "text-blue-400 bg-[#171c24]" : "text-neutral-500 hover:text-white"
            )}
            title="Component Library"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          
          {/* Layers */}
          <button
            onClick={() => setActiveTab("layers")}
            className={clsx(
              "p-1.5 rounded transition-all cursor-pointer",
              activeTab === "layers" ? "text-blue-400 bg-[#171c24]" : "text-neutral-500 hover:text-white"
            )}
            title="Layers Tree"
          >
            <Layers className="w-4 h-4" />
          </button>

          {/* Inspector */}
          <button
            onClick={() => setActiveTab("inspector")}
            className={clsx(
              "p-1.5 rounded transition-all cursor-pointer",
              activeTab === "inspector" ? "text-blue-400 bg-[#171c24]" : "text-neutral-500 hover:text-white"
            )}
            title="Block Style Inspector"
          >
            <Paintbrush className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab("settings")}
            className={clsx(
              "p-1.5 rounded transition-all cursor-pointer",
              activeTab === "settings" ? "text-blue-400 bg-[#171c24]" : "text-neutral-500 hover:text-white"
            )}
            title="Settings & Exporters"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* BLOCKS LIBRARY PANEL */}
        {activeTab === "blocks" && (
          <div className="space-y-6">
            {/* Grid Layouts */}
            <div>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2.5">
                Layout Grid
              </span>
              <div className="grid grid-cols-2 gap-2">
                {layoutBlocks.map((block) => (
                  <DraggableBlockItem
                    key={block.type}
                    block={block}
                    onAdd={() => handleAddBlock(block.type)}
                  />
                ))}
              </div>
            </div>

            {/* Typography */}
            {textBlocks.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2.5">
                  Typography
                </span>
                <div className="grid grid-cols-2 gap-2">
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

            {/* Metrics & Analytics */}
            {widgetBlocks.length > 0 && (
              <div>
                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block mb-2.5">
                  Metrics & Widgets
                </span>
                <div className="grid grid-cols-2 gap-2">
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
        )}

        {/* LAYERS DOCUMENT TREE PANEL */}
        {activeTab === "layers" && (
          <LayersPanel
            layout={layout}
            selectedBlockId={selectedBlockId}
            selectBlock={selectBlock}
            removeRow={removeRow}
            removeColumn={removeColumn}
            removeBlock={removeBlock}
            setActiveTab={setActiveTab}
          />
        )}

        {/* STYLE INSPECTOR PANEL */}
        {activeTab === "inspector" && (
          selectedBlock && selectedConfig ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#171c24]">
                <div>
                  <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider">
                    Selected Widget
                  </span>
                  <h3 className="text-xs font-bold text-white mt-0.5 uppercase tracking-wide">
                    {selectedConfig.name}
                  </h3>
                </div>
                <button
                  onClick={() => selectBlock(null)}
                  className="p-1 hover:bg-[#171c24] text-neutral-500 hover:text-white transition-colors rounded"
                  title="Deselect block"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Property Form */}
              <div className="space-y-4">
                {selectedConfig.editorFields.map((field) => {
                  const value = selectedBlock.properties[field.name] ?? field.defaultValue ?? "";

                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-[9px] font-bold tracking-wider uppercase text-neutral-400">
                        {field.label}
                      </label>

                      {field.type === "text" && (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-1.5 bg-[#171c24]/50 border border-[#171c24] focus:border-blue-500 focus:outline-none text-xs text-white rounded-lg transition-colors"
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          value={value}
                          rows={4}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-1.5 bg-[#171c24]/50 border border-[#171c24] focus:border-blue-500 focus:outline-none text-xs text-white resize-none rounded-lg transition-colors"
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-1.5 bg-[#171c24]/50 border border-[#171c24] focus:border-blue-500 focus:outline-none text-xs text-white rounded-lg transition-colors"
                        />
                      )}

                      {field.type === "color" && (
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-8 h-8 p-0 bg-transparent border-0 cursor-pointer rounded-lg"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#171c24]/50 border border-[#171c24] focus:border-blue-500 focus:outline-none text-xs text-white rounded-lg transition-colors"
                          />
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                            className="rounded border-[#171c24] bg-[#171c24] text-blue-500 w-4 h-4 focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-xs text-neutral-300">Enabled</span>
                        </label>
                      )}

                      {field.type === "select" && (
                        <select
                          value={value}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#171c24]/50 border border-[#171c24] focus:border-blue-500 focus:outline-none text-xs text-white rounded-lg transition-colors"
                        >
                          {field.options?.map((opt) => (
                            <option key={String(opt.value)} value={String(opt.value)} className="bg-[#1e2530] text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.description && (
                        <p className="text-[10px] text-neutral-500 leading-normal">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500">
              <Paintbrush className="w-8 h-8 mb-3 text-neutral-600 animate-pulse" />
              <p className="text-xs font-semibold">Style Manager</p>
              <p className="text-[10px] text-neutral-600 max-w-[200px] mt-1">
                Select any widget element on the canvas to inspect and edit style properties.
              </p>
            </div>
          )
        )}

        {/* SETTINGS & EXPORTERS PANEL */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">
                Serialization Engine
              </span>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Export and serialize active canvas layouts to standard formats.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportMode(exportMode === "json" ? "none" : "json")}
                className={clsx(
                  "py-2 px-3 border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-lg",
                  exportMode === "json"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-[#171c24] bg-[#171c24]/40 hover:bg-[#171c24]/80 text-[#c5cdd6]"
                )}
              >
                <FileJson className="w-3.5 h-3.5" />
                JSON
              </button>
              <button
                onClick={() => setExportMode(exportMode === "markdown" ? "none" : "markdown")}
                className={clsx(
                  "py-2 px-3 border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-lg",
                  exportMode === "markdown"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-[#171c24] bg-[#171c24]/40 hover:bg-[#171c24]/80 text-[#c5cdd6]"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Markdown
              </button>
            </div>

            {/* Serialized Code Output */}
            {exportMode !== "none" && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-neutral-550 uppercase tracking-wider">
                    Output Code
                  </span>
                  <button
                    onClick={() => handleCopy(exportedText)}
                    className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {copied ? (
                      <>
                        <ClipboardCheck className="w-3 h-3 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-3 h-3" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  readOnly
                  value={exportedText}
                  rows={14}
                  className="w-full p-3 font-mono text-[10px] bg-[#171c24]/60 border border-[#171c24] text-neutral-300 focus:outline-none resize-none rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer System Version */}
      <div className="p-3 border-t border-[#171c24] bg-[#171c24]/20 text-center shrink-0">
        <p className="text-[9px] font-semibold text-neutral-600 tracking-wide">
          GrapesJS Custom Layout UI v1.0.0
        </p>
      </div>
    </div>
  );
};

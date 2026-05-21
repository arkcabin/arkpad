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
        "group flex flex-col items-center justify-center p-3 aspect-square bg-neutral-50 dark:bg-neutral-950/40 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white rounded-lg transition-all duration-150 cursor-grab active:cursor-grabbing select-none text-center focus:outline-none",
        isDragging && "opacity-40 ring-1 ring-blue-500/50"
      )}
    >
      {IconComponent && (
        <IconComponent className="w-5 h-5 mb-1.5 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
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
      {/* Root Body Tag */}
      <div
        onClick={() => selectBlock(null)}
        className={clsx(
          "flex items-center justify-between p-2 rounded cursor-pointer transition-all border text-xs font-semibold",
          !selectedBlockId
            ? "bg-blue-500 border-blue-500 text-white font-bold"
            : "bg-neutral-50 dark:bg-[#171c24]/30 border-neutral-200 dark:border-neutral-850 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850/60 hover:text-neutral-950 dark:hover:text-white"
        )}
      >
        <span className="uppercase tracking-wider">
          Body (Canvas)
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 dark:bg-[#171c24]/60 text-neutral-600 dark:text-neutral-400 rounded">
          Root
        </span>
      </div>

      {layout.rows.length === 0 ? (
        <p className="text-xs text-neutral-550 text-center py-8">
          No layout sections created yet.
        </p>
      ) : (
        <div className="space-y-2.5 font-sans">
          {layout.rows.map((row: any, rIndex: number) => (
            <div key={row.id} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-1.5 bg-neutral-50/20 dark:bg-neutral-950/20">
              {/* Row Node */}
              <div className="flex items-center justify-between group/row-item py-0.5 px-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                  <span className="text-neutral-400 dark:text-neutral-500">#{rIndex + 1}</span>
                  <span>Section Row</span>
                </div>
                <button
                  onClick={() => removeRow(row.id)}
                  className="p-1 text-neutral-450 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  title="Delete Section Row"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              {/* Columns Node List */}
              <div className="pl-3.5 mt-1 space-y-2 border-l border-neutral-200 dark:border-neutral-800/80 ml-1">
                {row.columns.map((col: any, cIndex: number) => (
                  <div key={col.id} className="space-y-1">
                    <div className="flex items-center justify-between group/col-item py-0.5 px-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-neutral-550 dark:text-neutral-400">
                        <span>Column {cIndex + 1} ({col.width}/12)</span>
                      </div>
                      {row.columns.length > 1 && (
                        <button
                          onClick={() => removeColumn(col.id)}
                          className="p-1 text-neutral-450 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                          title="Delete Column"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>

                    {/* Blocks Node List */}
                    <div className="pl-3.5 space-y-1 border-l border-dashed border-neutral-350 dark:border-neutral-850 ml-1">
                      {col.blocks.length === 0 ? (
                        <span className="text-[9px] text-neutral-400 dark:text-neutral-600 italic block py-0.5 px-1">
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
                                  ? "bg-blue-500 border-blue-500 text-white font-bold"
                                  : "border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-850/60 hover:text-neutral-950 dark:hover:text-white"
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
                                className="p-0.5 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-455 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover/block-item:opacity-100"
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
    <div className="w-80 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full text-neutral-800 dark:text-neutral-200 select-none shrink-0 font-sans transition-colors duration-200">
      {/* Top Header Tab Switcher */}
      <div className="flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0 h-11">
        <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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
              activeTab === "blocks" ? "text-blue-500 bg-neutral-100 dark:bg-neutral-800" : "text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
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
              activeTab === "layers" ? "text-blue-500 bg-neutral-100 dark:bg-neutral-800" : "text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
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
              activeTab === "inspector" ? "text-blue-500 bg-neutral-100 dark:bg-neutral-800" : "text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
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
              activeTab === "settings" ? "text-blue-500 bg-neutral-100 dark:bg-neutral-800" : "text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
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
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2.5">
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
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2.5">
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
                <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2.5">
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
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Selected Widget
                  </span>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 uppercase tracking-wide">
                    {selectedConfig.name}
                  </h3>
                </div>
                <button
                  onClick={() => selectBlock(null)}
                  className="p-1 hover:bg-neutral-105 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors rounded"
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
                      <label className="text-[9px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                        {field.label}
                      </label>

                      {field.type === "text" && (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-xs text-neutral-950 dark:text-white rounded-lg transition-colors"
                        />
                      )}

                      {field.type === "textarea" && (
                        <textarea
                          value={value}
                          rows={4}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-xs text-neutral-955 dark:text-white resize-none rounded-lg transition-colors"
                        />
                      )}

                      {field.type === "number" && (
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-xs text-neutral-955 dark:text-white rounded-lg transition-colors"
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
                            className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-xs text-neutral-955 dark:text-white rounded-lg transition-colors"
                          />
                        </div>
                      )}

                      {field.type === "checkbox" && (
                        <label className="flex items-center gap-2 cursor-pointer pt-1">
                          <input
                            type="checkbox"
                            checked={!!value}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                            className="rounded border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-blue-500 w-4 h-4 focus:ring-0 focus:ring-offset-0"
                          />
                          <span className="text-xs text-neutral-600 dark:text-neutral-350">Enabled</span>
                        </label>
                      )}

                      {field.type === "select" && (
                        <select
                          value={value}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none text-xs text-neutral-955 dark:text-white rounded-lg transition-colors"
                        >
                          {field.options?.map((opt) => (
                            <option key={String(opt.value)} value={String(opt.value)} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {field.description && (
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-normal">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-450 dark:text-neutral-500">
              <Paintbrush className="w-8 h-8 mb-3 text-neutral-300 dark:text-neutral-700 animate-pulse" />
              <p className="text-xs font-semibold">Style Manager</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-600 max-w-[200px] mt-1">
                Select any widget element on the canvas to inspect and edit style properties.
              </p>
            </div>
          )
        )}

        {/* SETTINGS & EXPORTERS PANEL */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block">
                Serialization Engine
              </span>
              <p className="text-[11px] text-neutral-450 dark:text-neutral-550 leading-relaxed">
                Export and serialize active canvas layouts to standard formats.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportMode(exportMode === "json" ? "none" : "json")}
                className={clsx(
                  "py-2 px-3 border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer rounded-lg",
                  exportMode === "json"
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-955 text-neutral-650 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
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
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-955 text-neutral-650 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
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
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Output Code
                  </span>
                  <button
                    onClick={() => handleCopy(exportedText)}
                    className="flex items-center gap-1.5 text-[10px] text-blue-500 dark:text-blue-450 hover:underline transition-all"
                  >
                    {copied ? (
                      <>
                        <ClipboardCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-450" />
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
                  className="w-full p-3 font-mono text-[10px] bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 focus:outline-none resize-none rounded-lg"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer System Version */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-955/20 text-center shrink-0">
        <p className="text-[9px] font-semibold text-neutral-400 dark:text-neutral-500 tracking-wide">
          Builder Layout Engine v1.0.0
        </p>
      </div>
    </div>
  );
};

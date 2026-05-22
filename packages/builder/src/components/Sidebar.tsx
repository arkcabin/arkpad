import React, { useState } from "react";
import { useBuilder, isBlockInsideForm } from "../core/BuilderContext";
import { blockRegistry } from "../core/registry";
import { exportToJSON, exportToMarkdown } from "../core/export";
import { PageBlock, NormalizedPageConfig } from "../core/types";
import {
  FileJson,
  FileText,
  Clipboard,
  ClipboardCheck,
  X,
  Layers,
  Settings,
  Trash2,
  Paintbrush,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Plus,
  Undo2,
  Redo2,
  Settings2,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import clsx from "clsx";
import { generateId } from "../core/store";

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
        "group flex flex-col items-center justify-center p-3 aspect-square bg-neutral-50 dark:bg-neutral-950/40 hover:bg-neutral-100 dark:hover:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350 hover:text-neutral-950 dark:hover:text-white rounded-none border-solid transition-all duration-155 cursor-grab active:cursor-grabbing select-none text-center focus:outline-none w-full",
        isDragging && "opacity-40 ring-1 ring-neutral-400 dark:ring-neutral-600"
      )}
    >
      {IconComponent && (
        <IconComponent className="w-4 h-4 mb-1.5 text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-950 dark:group-hover:text-white transition-colors" />
      )}
      <span className="text-[9px] font-mono font-bold tracking-wider uppercase truncate w-full">
        {block.name}
      </span>
    </button>
  );
};

// Document Tree Layers Panel Component
interface LayerItemProps {
  id: string;
  depth: number;
  selectedBlockId: string | null;
  blocks: Record<string, PageBlock>;
  selectBlock: (id: string | null) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<PageBlock>) => void;
  setActiveTab: (tab: any) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  id,
  depth,
  selectedBlockId,
  blocks,
  selectBlock,
  removeBlock,
  updateBlock,
  setActiveTab,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const block = blocks[id];
  if (!block) return null;

  const definition = blockRegistry.get(block.type);
  const isSelected = selectedBlockId === id;
  const childIds = (block.children || []) as string[];
  const hasChildren = childIds.length > 0;

  return (
    <div className="space-y-0.5">
      <div
        onClick={(e) => {
          e.stopPropagation();
          selectBlock(id);
          setActiveTab("inspector");
        }}
        className={clsx(
          "flex items-center justify-between p-1.5 border transition-all cursor-pointer text-[11px] font-mono select-none group/layer-item rounded-none border-solid",
          isSelected
            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-black dark:border-white font-bold"
            : "border-transparent text-neutral-700 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-850/60"
        )}
        style={{ paddingLeft: `${depth * 12 + 6}px` }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(!collapsed);
              }}
              className="p-0.5 text-neutral-450 hover:text-neutral-950 dark:hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              {collapsed ? (
                <ChevronRight className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4" />
          )}
          {definition?.icon && (
            <definition.icon className={clsx(
              "w-3.5 h-3.5 shrink-0",
              isSelected ? "text-white dark:text-black" : "text-neutral-400 group-hover/layer-item:text-neutral-950 dark:group-hover/layer-item:text-white"
            )} />
          )}
          <span className="truncate pr-1">
            {definition?.name || block.type}
          </span>
          {!block.enabled && (
            <span className="text-[8px] px-1 py-0.2 bg-neutral-200 dark:bg-neutral-800 text-neutral-500 rounded font-sans shrink-0 uppercase tracking-wide">
              Hidden
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover/layer-item:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateBlock(id, { enabled: !block.enabled });
            }}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded transition-colors text-neutral-450 hover:text-neutral-900 dark:hover:text-neutral-200"
            title={block.enabled ? "Hide Block" : "Show Block"}
          >
            {block.enabled ? (
              <Eye className="w-3 h-3" />
            ) : (
              <EyeOff className="w-3 h-3" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeBlock(id);
            }}
            className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded hover:text-red-500 transition-colors text-neutral-450"
            title="Delete Block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="space-y-0.5">
          {childIds.map((childId) => (
            <LayerItem
              key={childId}
              id={childId}
              depth={depth + 1}
              selectedBlockId={selectedBlockId}
              blocks={blocks}
              selectBlock={selectBlock}
              removeBlock={removeBlock}
              updateBlock={updateBlock}
              setActiveTab={setActiveTab}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const LayersPanel: React.FC<{
  pageConfig: NormalizedPageConfig | null;
  selectedBlockId: string | null;
  selectBlock: (id: string | null) => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<PageBlock>) => void;
  setActiveTab: (tab: any) => void;
}> = ({
  pageConfig,
  selectedBlockId,
  selectBlock,
  removeBlock,
  updateBlock,
  setActiveTab,
}) => {
  const blocks = pageConfig?.blocks || {};
  const rootIds = pageConfig?.rootIds || [];

  return (
    <div className="space-y-4">
      {/* Root Canvas Selection */}
      <div
        onClick={() => selectBlock(null)}
        className={clsx(
          "flex items-center justify-between p-2 cursor-pointer transition-all border text-xs font-mono font-bold rounded-none border-solid",
          !selectedBlockId
            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-black dark:border-white"
            : "bg-neutral-50 dark:bg-neutral-950/40 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-350 hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
        )}
      >
        <span className="uppercase tracking-wider">
          Body (Canvas)
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-500 rounded font-sans uppercase font-bold tracking-wide">
          Root
        </span>
      </div>

      {rootIds.length === 0 ? (
        <p className="text-[11px] text-neutral-500 text-center py-8 font-mono">
          No components placed yet.
        </p>
      ) : (
        <div className="space-y-1 font-sans">
          {rootIds.map((id) => (
            <LayerItem
              key={id}
              id={id}
              depth={0}
              selectedBlockId={selectedBlockId}
              blocks={blocks}
              selectBlock={selectBlock}
              removeBlock={removeBlock}
              updateBlock={updateBlock}
              setActiveTab={setActiveTab}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const pageConfig = useBuilder((s) => s.pageConfig);
  const selectedBlockId = useBuilder((s) => s.selectedBlockId);
  const selectBlock = useBuilder((s) => s.selectBlock);
  const updateBlock = useBuilder((s) => s.updateBlock);
  const addBlock = useBuilder((s) => s.addBlock);
  const removeBlock = useBuilder((s) => s.removeBlock);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const pastCount = useBuilder((s) => s.past.length);
  const futureCount = useBuilder((s) => s.future.length);

  const [activeTab, setActiveTab] = useState<"blocks" | "layers" | "inspector" | "settings">("blocks");
  const [isExpanded, setIsExpanded] = useState(true);
  const [exportMode, setExportMode] = useState<"none" | "json" | "markdown">("none");
  const [copied, setCopied] = useState(false);
  const [stylesAccordionOpen, setStylesAccordionOpen] = useState(false);
  const [interactionsAccordionOpen, setInteractionsAccordionOpen] = useState(false);

  // Automatically switch to inspector and expand on block selection
  React.useEffect(() => {
    if (selectedBlockId) {
      setActiveTab("inspector");
      setIsExpanded(true);
    }
  }, [selectedBlockId]);

  const handleTabClick = (tab: "blocks" | "layers" | "inspector" | "settings") => {
    setActiveTab(tab);
    if (!isExpanded) setIsExpanded(true);
  };

  const allBlocks = blockRegistry.getAll();
  const selectedBlock = selectedBlockId && pageConfig?.blocks[selectedBlockId]
    ? pageConfig.blocks[selectedBlockId]
    : null;
  const selectedConfig = selectedBlock ? blockRegistry.get(selectedBlock.type) : null;

  const handleFieldChange = (fieldName: string, value: any) => {
    if (selectedBlockId) {
      updateBlock(selectedBlockId, {
        props: { [fieldName]: value },
      });
    }
  };

  const handleStyleChange = (styleName: string, value: any) => {
    if (selectedBlockId) {
      updateBlock(selectedBlockId, {
        styles: { [styleName]: value },
      });
    }
  };

  const handleInteractionChange = (field: string, value: any) => {
    if (!selectedBlockId || !selectedBlock) return;
    const currentInteractions = selectedBlock.interactions || [];
    let clickInteraction = currentInteractions.find((i) => i.trigger === "click") || {
      id: generateId(),
      trigger: "click",
      action: "alert",
      settings: {},
    };

    if (field === "action") {
      clickInteraction = {
        ...clickInteraction,
        action: value,
      };
    } else {
      clickInteraction = {
        ...clickInteraction,
        settings: {
          ...clickInteraction.settings,
          [field]: value,
        },
      };
    }

    const nextInteractions = [
      ...currentInteractions.filter((i) => i.trigger !== "click"),
      clickInteraction,
    ];

    updateBlock(selectedBlockId, {
      interactions: nextInteractions,
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddBlock = (blockType: string) => {
    if (blockType === "form-field") {
      const isSelectedInsideForm = selectedBlockId
        ? isBlockInsideForm(pageConfig?.blocks || {}, selectedBlockId)
        : false;
      if (!isSelectedInsideForm) {
        alert("Form Fields must be placed inside a Form block or a container inside a Form block.");
        return;
      }
    }

    if (blockType === "form") {
      const isSelectedInsideForm = selectedBlockId
        ? isBlockInsideForm(pageConfig?.blocks || {}, selectedBlockId)
        : false;
      if (isSelectedInsideForm) {
        alert("Nested Forms are not allowed.");
        return;
      }
    }

    if (selectedBlockId && pageConfig) {
      const selBlock = pageConfig.blocks[selectedBlockId];
      if (selBlock && selBlock.type === "form") {
        const isAllowedInForm = [
          "button",
          "header",
          "container",
          "layout",
          "text",
          "content",
          "text-editor",
          "image",
          "form-field",
        ].includes(blockType);
        if (!isAllowedInForm) {
          alert(`Block of type "${blockType}" is not allowed directly inside a Form.`);
          return;
        }
      }
    }

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
    if (selectedBlockId && pageConfig) {
      const selBlock = pageConfig.blocks[selectedBlockId];
      if (selBlock) {
        const isContainerLike = ["container", "layout", "form"].includes(selBlock.type);
        parentId = isContainerLike ? selectedBlockId : selBlock.parentId;
      }
    }

    addBlock(newBlock, parentId);
  };

  // Group blocks by logical categories
  const layoutBlocks = allBlocks.filter((b) => ["container", "layout"].includes(b.type));
  const typographyBlocks = allBlocks.filter((b) => ["header", "text", "text-editor", "content", "media"].includes(b.type));
  const widgetBlocks = allBlocks.filter((b) => ["table", "metric", "chart"].includes(b.type));
  const formBlocks = allBlocks.filter((b) => ["form", "form-field", "button"].includes(b.type));

  const exportedText =
    exportMode === "json"
      ? exportToJSON(pageConfig || { blocks: {}, rootIds: [] })
      : exportMode === "markdown"
      ? exportToMarkdown(pageConfig || { blocks: {}, rootIds: [] })
      : "";

  return (
    <div
      className={clsx(
        "bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full text-neutral-800 dark:text-neutral-200 select-none shrink-0 font-sans transition-all duration-300 ease-in-out border-solid",
        isExpanded ? "w-[350px]" : "w-[48px]"
      )}
    >
      <div className="flex h-full w-full flex-row overflow-hidden">
        {/* Content Area */}
        <div
          className={clsx(
            "flex flex-col flex-1 min-w-0 h-full transition-all duration-300 ease-in-out",
            isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"
          )}
        >
          {/* Top Header Tab Switcher */}
          <div className="flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0 h-11 border-solid">
            <div className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              {activeTab === "blocks" && (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Blocks</span>
                </>
              )}
              {activeTab === "layers" && (
                <>
                  <Layers className="w-3.5 h-3.5" />
                  <span>Layers</span>
                </>
              )}
              {activeTab === "inspector" && (
                <>
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Properties</span>
                </>
              )}
              {activeTab === "settings" && (
                <>
                  <Settings className="w-3.5 h-3.5" />
                  <span>Serialization</span>
                </>
              )}
            </div>
        <div className="flex items-center gap-1">
          {/* Undo */}
          <button
            onClick={undo}
            disabled={pastCount === 0}
            className="p-1.5 rounded-none text-neutral-400 hover:text-neutral-950 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          {/* Redo */}
          <button
            onClick={redo}
            disabled={futureCount === 0}
            className="p-1.5 rounded-none text-neutral-400 hover:text-neutral-950 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none mr-2 border-r border-neutral-200 dark:border-neutral-800 pr-2 border-solid"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Collapse Button */}
          <button
            onClick={() => setIsExpanded(false)}
            className="p-1.5 text-neutral-400 hover:text-neutral-950 dark:hover:text-white rounded-none transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {/* BLOCKS LIBRARY PANEL */}
        {activeTab === "blocks" && (
          <div className="space-y-6">
            {/* Grid Layouts */}
            {layoutBlocks.length > 0 && (
              <div>
                <span className="text-[9px] font-mono font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest block mb-2.5">
                  Layout & Grid
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
            )}

            {/* Typography */}
            {typographyBlocks.length > 0 && (
              <div>
                <span className="text-[9px] font-mono font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest block mb-2.5">
                  Typography & Media
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {typographyBlocks.map((block) => (
                    <DraggableBlockItem
                      key={block.type}
                      block={block}
                      onAdd={() => handleAddBlock(block.type)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Forms & Inputs */}
            {formBlocks.length > 0 && (
              <div>
                <span className="text-[9px] font-mono font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest block mb-2.5">
                  Forms & Controls
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {formBlocks.map((block) => (
                    <DraggableBlockItem
                      key={block.type}
                      block={block}
                      onAdd={() => handleAddBlock(block.type)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Widgets & Tables */}
            {widgetBlocks.length > 0 && (
              <div>
                <span className="text-[9px] font-mono font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest block mb-2.5">
                  Telemetry & Data
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
            pageConfig={pageConfig}
            selectedBlockId={selectedBlockId}
            selectBlock={selectBlock}
            removeBlock={removeBlock}
            updateBlock={updateBlock}
            setActiveTab={setActiveTab}
          />
        )}

        {/* STYLE INSPECTOR PANEL */}
        {activeTab === "inspector" && (
          selectedBlock && selectedConfig ? (
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 border-solid">
                <div>
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                    Selected Element
                  </span>
                  <h3 className="text-xs font-bold text-neutral-900 dark:text-white mt-0.5 uppercase tracking-wide">
                    {selectedConfig.name}
                  </h3>
                </div>
                <button
                  onClick={() => selectBlock(null)}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-550 hover:text-neutral-950 dark:hover:text-white transition-colors rounded-none"
                  title="Deselect block"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Accordion 1: Core Custom Properties */}
              <div className="space-y-3.5 pt-2">
                <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-widest block mb-1">
                  Properties
                </span>

                {selectedConfig.editorFields.length === 0 ? (
                  <p className="text-[10px] text-neutral-400 italic">No customizable properties.</p>
                ) : (
                  selectedConfig.editorFields.map((field) => {
                    const value = selectedBlock.props?.[field.name] ?? field.defaultValue ?? "";

                    return (
                      <div key={field.name} className="space-y-1">
                        <label className="text-[9px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                          {field.label}
                        </label>

                        {field.type === "text" && (
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 focus:border-neutral-900 dark:focus:border-neutral-100 focus:outline-none text-[11px] text-neutral-950 dark:text-white rounded-none border-solid transition-colors font-mono"
                          />
                        )}

                        {field.type === "textarea" && (
                          <textarea
                            value={value}
                            rows={3}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-neutral-900 dark:focus:border-neutral-100 focus:outline-none text-[11px] text-neutral-955 dark:text-white resize-none rounded-none border-solid transition-colors font-mono"
                          />
                        )}

                        {field.type === "number" && (
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                            placeholder={field.placeholder}
                            className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-neutral-900 dark:focus:border-neutral-100 focus:outline-none text-[11px] text-neutral-955 dark:text-white rounded-none border-solid transition-colors font-mono"
                          />
                        )}

                        {field.type === "color" && (
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              className="w-8 h-8 p-0 bg-transparent border-0 cursor-pointer rounded-none"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleFieldChange(field.name, e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-neutral-900 dark:focus:border-neutral-100 focus:outline-none text-[11px] text-neutral-955 dark:text-white rounded-none border-solid transition-colors font-mono"
                            />
                          </div>
                        )}

                        {field.type === "checkbox" && (
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              checked={!!value}
                              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                              className="border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 w-3.5 h-3.5 focus:ring-0 focus:ring-offset-0 rounded-none border-solid"
                            />
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-350">Active / Enabled</span>
                          </label>
                        )}

                        {field.type === "select" && (
                          <select
                            value={value}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 focus:border-neutral-900 dark:focus:border-neutral-100 focus:outline-none text-[11px] text-neutral-955 dark:text-white rounded-none border-solid transition-colors font-mono"
                          >
                            {field.options?.map((opt) => (
                              <option key={String(opt.value)} value={String(opt.value)} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.description && (
                          <p className="text-[9px] text-neutral-400 dark:text-neutral-500 leading-normal font-sans">{field.description}</p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Accordion 2: Layout / Sizing Styles */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 border-solid pt-3.5">
                <button
                  onClick={() => setStylesAccordionOpen(!stylesAccordionOpen)}
                  className="flex items-center justify-between w-full text-neutral-450 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase tracking-widest text-[9px] font-bold focus:outline-none"
                >
                  <span>Layout Styles</span>
                  {stylesAccordionOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>

                {stylesAccordionOpen && (
                  <div className="space-y-3 pt-3">
                    {/* Width & Height */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-450 uppercase">Width</label>
                        <input
                          type="text"
                          value={selectedBlock.styles?.width || ""}
                          placeholder="e.g. 100%, auto"
                          onChange={(e) => handleStyleChange("width", e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-450 uppercase">Height</label>
                        <input
                          type="text"
                          value={selectedBlock.styles?.height || ""}
                          placeholder="e.g. auto, 200px"
                          onChange={(e) => handleStyleChange("height", e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                        />
                      </div>
                    </div>

                    {/* Padding & Margin */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-450 uppercase">Padding</label>
                        <input
                          type="text"
                          value={selectedBlock.styles?.padding || ""}
                          placeholder="e.g. 1rem, 16px"
                          onChange={(e) => handleStyleChange("padding", e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-450 uppercase">Margin</label>
                        <input
                          type="text"
                          value={selectedBlock.styles?.margin || ""}
                          placeholder="e.g. 0px, auto"
                          onChange={(e) => handleStyleChange("margin", e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100"
                        />
                      </div>
                    </div>

                    {/* Flex specific styling configurations */}
                    {selectedBlock.type === "container" && (
                      <div className="space-y-3 pt-1.5 border-t border-dashed border-neutral-200 dark:border-neutral-800 border-solid">
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-450 uppercase">Flex Direction</label>
                          <select
                            value={selectedBlock.styles?.flexDirection || "column"}
                            onChange={(e) => handleStyleChange("flexDirection", e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                          >
                            <option value="column">Column (Vertical)</option>
                            <option value="row">Row (Horizontal)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-450 uppercase">Justify Content</label>
                          <select
                            value={selectedBlock.styles?.justifyContent || "start"}
                            onChange={(e) => handleStyleChange("justifyContent", e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                          >
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                            <option value="between">Space Between</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-450 uppercase">Align Items</label>
                          <select
                            value={selectedBlock.styles?.alignItems || "stretch"}
                            onChange={(e) => handleStyleChange("alignItems", e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                          >
                            <option value="stretch">Stretch</option>
                            <option value="start">Start</option>
                            <option value="center">Center</option>
                            <option value="end">End</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-450 uppercase">Gap spacing</label>
                          <input
                            type="text"
                            value={selectedBlock.styles?.gap || ""}
                            placeholder="e.g. 1rem, 8px"
                            onChange={(e) => handleStyleChange("gap", e.target.value)}
                            className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {/* Fallback Custom CSS Class */}
                    <div className="space-y-1">
                      <label className="text-[9px] text-neutral-450 uppercase">CSS Classnames</label>
                      <input
                        type="text"
                        value={selectedBlock.styles?.className || ""}
                        placeholder="e.g. shadow-sm border"
                        onChange={(e) => handleStyleChange("className", e.target.value)}
                        className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Interactions Trigger Settings */}
              {selectedBlock.type === "button" && (
                <div className="border-t border-neutral-200 dark:border-neutral-800 border-solid pt-3.5">
                  <button
                    onClick={() => setInteractionsAccordionOpen(!interactionsAccordionOpen)}
                    className="flex items-center justify-between w-full text-neutral-450 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white uppercase tracking-widest text-[9px] font-bold focus:outline-none"
                  >
                    <span>Click Actions</span>
                    {interactionsAccordionOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {interactionsAccordionOpen && (
                    <div className="space-y-3 pt-3">
                      {/* Action trigger type */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-neutral-450 uppercase">Action</label>
                        <select
                          value={
                            (selectedBlock.interactions && selectedBlock.interactions[0]?.action) ||
                            "alert"
                          }
                          onChange={(e) => handleInteractionChange("action", e.target.value)}
                          className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                        >
                          <option value="alert">System Alert</option>
                          <option value="navigate">Redirect/Navigate URL</option>
                        </select>
                      </div>

                      {/* Display field depending on selected action */}
                      {((selectedBlock.interactions && selectedBlock.interactions[0]?.action) ||
                        "alert") === "alert" ? (
                        <div className="space-y-1">
                          <label className="text-[9px] text-neutral-450 uppercase">Alert Text</label>
                          <textarea
                            value={
                              selectedBlock.interactions?.[0]?.settings?.description || ""
                            }
                            rows={2}
                            onChange={(e) =>
                              handleInteractionChange("description", e.target.value)
                            }
                            placeholder="System alert message description..."
                            className="w-full px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none resize-none"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-450 uppercase">Destination URL</label>
                            <input
                              type="text"
                              value={
                                selectedBlock.interactions?.[0]?.settings?.url || ""
                              }
                              onChange={(e) =>
                                handleInteractionChange("url", e.target.value)
                              }
                              placeholder="https://example.com"
                              className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] text-neutral-450 uppercase">Target Tab</label>
                            <select
                              value={
                                selectedBlock.interactions?.[0]?.settings?.target ||
                                "_self"
                              }
                              onChange={(e) =>
                                handleInteractionChange("target", e.target.value)
                              }
                              className="w-full px-2 py-1 bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-850 text-[11px] text-neutral-900 dark:text-white rounded-none border-solid focus:outline-none"
                            >
                              <option value="_self">Current Tab (_self)</option>
                              <option value="_blank">New Tab (_blank)</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-450 dark:text-neutral-500">
              <Paintbrush className="w-7 h-7 mb-3 text-neutral-300 dark:text-neutral-700 animate-pulse animate-duration-1000" />
              <p className="text-xs font-semibold uppercase tracking-wider font-mono">Properties</p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-600 max-w-[200px] mt-1.5 leading-relaxed">
                Select any widget element on the canvas to inspect and edit properties.
              </p>
            </div>
          )
        )}

        {/* SETTINGS & EXPORTERS PANEL */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block font-mono">
                Serialization
              </span>
              <p className="text-[11px] text-neutral-450 dark:text-neutral-550 leading-relaxed font-mono">
                Export and serialize active canvas layouts to JSON or Markdown formats.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportMode(exportMode === "json" ? "none" : "json")}
                className={clsx(
                  "py-2 px-3 border text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none border-solid",
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
                  "py-2 px-3 border text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer rounded-none border-solid",
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
                  <span className="text-[9px] font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-mono">
                    Output Code
                  </span>
                  <button
                    onClick={() => handleCopy(exportedText)}
                    className="flex items-center gap-1.5 text-[10px] text-neutral-900 dark:text-neutral-200 hover:underline transition-all font-mono font-bold"
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
                  className="w-full p-3 font-mono text-[10px] bg-neutral-50 dark:bg-neutral-955 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 focus:outline-none resize-none rounded-none border-solid"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer System Version */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-955/20 text-center shrink-0 border-solid">
        <p className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider uppercase font-mono">
          Headless Layout Engine v2.0
        </p>
      </div>
    </div>

    {/* Icon Rail */}
    <div className="flex flex-col items-center py-3 gap-2.5 w-[48px] border-l border-neutral-200 dark:border-neutral-800 bg-neutral-50/20 dark:bg-neutral-955/20 shrink-0 z-10 bg-white dark:bg-neutral-900">
      <button
        onClick={() => handleTabClick("blocks")}
        className={clsx(
          "p-2 border transition-all cursor-pointer rounded-none border-solid focus:outline-none",
          activeTab === "blocks" && isExpanded
            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-black dark:border-white"
            : "border-transparent text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        )}
        title="Add Blocks"
      >
        <Plus className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => handleTabClick("inspector")}
        className={clsx(
          "p-2 border transition-all cursor-pointer rounded-none border-solid focus:outline-none",
          activeTab === "inspector" && isExpanded
            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-black dark:border-white"
            : "border-transparent text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        )}
        title="Properties"
      >
        <Settings2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleTabClick("layers")}
        className={clsx(
          "p-2 border transition-all cursor-pointer rounded-none border-solid focus:outline-none",
          activeTab === "layers" && isExpanded
            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-black dark:border-white"
            : "border-transparent text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        )}
        title="Layers"
      >
        <Layers className="w-4 h-4" />
      </button>

      <button
        onClick={() => handleTabClick("settings")}
        className={clsx(
          "p-2 border transition-all cursor-pointer rounded-none border-solid focus:outline-none",
          activeTab === "settings" && isExpanded
            ? "bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:text-black dark:border-white"
            : "border-transparent text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
        )}
        title="Serialization"
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  </div>
  </div>
  );
};

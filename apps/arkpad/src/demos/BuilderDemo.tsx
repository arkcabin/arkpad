import React, { useState, useCallback } from "react";
import { useArkpadEditor, ArkpadEditorContent, ArkpadProvider } from "@arkpad/react";
import { StarterKit } from "@arkpad/starter-kit";
import {
  Plus,
  Type,
  Heading1,
  Minus,
  Quote,
  List,
  Code2,
  Columns2,
  Layers,
  Settings,
  Square,
  ChevronRight,
} from "lucide-react";
import { useBuilderNav } from "../lib/BuilderNavContext";

/* ── Types ────────────────────────────────────────────────────── */

type BlockType = "text" | "heading" | "divider" | "quote" | "list" | "code" | "columns" | "section";
type SidebarTab = "blocks" | "structure" | "settings";

const BLOCKS: { type: BlockType; label: string; icon: React.ReactNode }[] = [
  { type: "section", label: "Section", icon: <Square className="w-4 h-4" /> },
  { type: "heading", label: "Heading", icon: <Heading1 className="w-4 h-4" /> },
  { type: "text", label: "Text", icon: <Type className="w-4 h-4" /> },
  { type: "quote", label: "Quote", icon: <Quote className="w-4 h-4" /> },
  { type: "list", label: "List", icon: <List className="w-4 h-4" /> },
  { type: "code", label: "Code", icon: <Code2 className="w-4 h-4" /> },
  { type: "divider", label: "Divider", icon: <Minus className="w-4 h-4" /> },
  { type: "columns", label: "2 Columns", icon: <Columns2 className="w-4 h-4" /> },
];

/* ── Main Component ─────────────────────────────────────────── */

interface BuilderDemoProps {
  maxWidth?: string;
}

export function BuilderDemo({ maxWidth = "100%" }: BuilderDemoProps) {
  const { navOpen, previewMode } = useBuilderNav();
  const [activeTab, setActiveTab] = useState<SidebarTab>("blocks");

  const editor = useArkpadEditor({
    extensions: [StarterKit],
    content: `
      <section data-type="section">
        <h2>Modular Builder</h2>
        <p>This builder is now powered by a single Arkpad instance using modular extensions.</p>
      </section>
      <section data-type="section" style="background-color: #f9fafb">
        <p>You can add sections and blocks directly from the sidebar.</p>
      </section>
    `,
    editable: true,
  });

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      if (!editor) return;

      switch (type) {
        case "section":
          editor.runCommand("setSection");
          break;
        case "heading":
          editor.runCommand("toggleHeading", { level: 2 });
          break;
        case "text":
          editor.runCommand("setParagraph");
          break;
        case "divider":
          editor.runCommand("setHorizontalRule");
          break;
        case "quote":
          editor.runCommand("toggleBlockquote");
          break;
        case "list":
          editor.runCommand("toggleBulletList");
          break;
        case "code":
          editor.runCommand("toggleCodeBlock");
          break;
        default:
          console.warn("Command not implemented for type:", type);
      }
    },
    [editor]
  );

  const handleDragStart = useCallback((e: React.DragEvent, type: BlockType) => {
    e.dataTransfer.setData("application/x-arkpad-block", type);
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag image (ghost preview)
    const dragImg = document.createElement("div");
    dragImg.className =
      "fixed top-[-1000px] left-[-1000px] bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-xl flex items-center gap-2 z-[9999]";
    dragImg.innerHTML = `<span>Drag to Add ${type.charAt(0).toUpperCase() + type.slice(1)}</span>`;
    document.body.appendChild(dragImg);

    e.dataTransfer.setDragImage(dragImg, -10, -10);

    // Clean up after drag ends - use dragend event on the source element
    const cleanup = () => {
      if (dragImg.parentNode) {
        document.body.removeChild(dragImg);
      }
      e.target.removeEventListener("dragend", cleanup);
    };
    e.target.addEventListener("dragend", cleanup);
  }, []);

  // Update editor editable state when mode changes
  React.useEffect(() => {
    if (!editor) {
      console.warn("[BuilderDemo] Editor not initialized yet");
      return;
    }
    try {
      editor.setEditable(!previewMode);
    } catch (err) {
      console.error("[BuilderDemo] Failed to set editable state:", err);
    }
  }, [editor, previewMode]);

  return (
    <div
      className={`flex flex-1 h-full overflow-hidden font-sans transition-all duration-700 ${previewMode ? "bg-white" : "bg-[#f8f9fb]"}`}
    >
      {/* Main Canvas Area - The "Stage" */}
      <div
        className={`flex-1 overflow-y-auto flex flex-col scrollbar-hide relative transition-all duration-700 ${previewMode ? "p-0" : "p-8 lg:p-12"}`}
      >
        {/* The Paper / Canvas */}
        <div
          className="mx-auto bg-white transition-all duration-700"
          style={{
            maxWidth,
            width: "100%",
            minHeight: "100%",
            ...(previewMode
              ? {}
              : {
                  boxShadow: "0 8px 30px rgb(0,0,0,0.04)",
                  border: "1px solid #f3f4f6",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }),
          }}
        >
          <ArkpadProvider editor={editor}>
            <div
              className={`w-full min-h-full transition-all duration-700 arkpad-editor-container p-0 ${
                previewMode ? "preview-mode" : ""
              }`}
            >
              <ArkpadEditorContent editor={editor} className="min-h-full" />
            </div>
          </ArkpadProvider>
        </div>
      </div>

      {/* Right Sidebar - Figma Style */}
      {navOpen && !previewMode && (
        <aside className="w-[280px] border-l border-gray-100 flex flex-col bg-white shrink-0 z-10 shadow-[-4px_0_12px_rgba(0,0,0,0.02)] animate-in slide-in-from-right duration-300">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-100 px-2 gap-1 mt-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-semibold transition-all border-b-2 -mb-[1px] ${activeTab === "blocks" ? "text-black border-black" : "text-gray-400 border-transparent hover:text-gray-600"}`}
              onClick={() => setActiveTab("blocks")}
            >
              <Plus size={14} />
              Blocks
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-semibold transition-all border-b-2 -mb-[1px] ${activeTab === "structure" ? "text-black border-black" : "text-gray-400 border-transparent hover:text-gray-600"}`}
              onClick={() => setActiveTab("structure")}
            >
              <Layers size={14} />
              Layers
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-semibold transition-all border-b-2 -mb-[1px] ${activeTab === "settings" ? "text-black border-black" : "text-gray-400 border-transparent hover:text-gray-600"}`}
              onClick={() => setActiveTab("settings")}
            >
              <Settings size={14} />
              Page
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {/* BLOCKS TAB */}
            {activeTab === "blocks" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                    Layout
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddBlock("section")}
                      draggable
                      onDragStart={(e) => handleDragStart(e, "section")}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-black hover:shadow-sm transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Square className="w-5 h-5 mb-2 text-gray-400 group-hover:text-black transition-colors" />
                      <span className="text-[10px] font-medium text-gray-600 group-hover:text-black">
                        Section
                      </span>
                    </button>
                    <button
                      onClick={() => handleAddBlock("columns")}
                      draggable
                      onDragStart={(e) => handleDragStart(e, "columns")}
                      className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-black hover:shadow-sm transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <Columns2 className="w-5 h-5 mb-2 text-gray-400 group-hover:text-black transition-colors" />
                      <span className="text-[10px] font-medium text-gray-600 group-hover:text-black">
                        2 Columns
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                    Elements
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {BLOCKS.filter(
                      (b) => b.type !== "columns" && b.type !== "section" && b.type !== "divider"
                    ).map((block) => (
                      <button
                        key={block.type}
                        onClick={() => handleAddBlock(block.type)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block.type)}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-black hover:shadow-sm transition-all group cursor-grab active:cursor-grabbing"
                      >
                        <div className="w-5 h-5 mb-2 text-gray-400 group-hover:text-black transition-colors">
                          {block.icon}
                        </div>
                        <span className="text-[10px] font-medium text-gray-600 group-hover:text-black">
                          {block.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LAYERS TAB */}
            {activeTab === "structure" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Document Hierarchy
                  </h3>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100 group cursor-default">
                    <ChevronRight size={12} className="text-gray-400" />
                    <Square size={12} className="text-emerald-500 fill-emerald-500/10" />
                    <span className="text-[11px] font-medium text-gray-700">Root Section</span>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-default">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      </div>
                      <Type size={12} className="text-gray-400" />
                      <span className="text-[11px] text-gray-600">Heading 1</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group cursor-default">
                      <div className="w-3 h-3 flex items-center justify-center">
                        <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      </div>
                      <Type size={12} className="text-gray-400" />
                      <span className="text-[11px] text-gray-600">Paragraph</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] text-gray-600 font-medium">Show Grid</span>
                      <div className="w-8 h-4 bg-black rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[11px] text-gray-600 font-medium">Dark Mode</span>
                      <div className="w-8 h-4 bg-gray-200 rounded-full relative cursor-pointer">
                        <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
                    Metadata
                  </h3>
                  <div className="space-y-3 px-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-tight">
                        Title
                      </label>
                      <input
                        type="text"
                        defaultValue="My Awesome Page"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-200 rounded-md shadow-sm">
                <Square size={10} className="fill-emerald-500 text-emerald-500" />
                <span className="text-gray-600">Published</span>
              </div>
              <span>Today, 2:45 PM</span>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

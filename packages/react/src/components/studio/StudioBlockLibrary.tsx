import React, { useState, useEffect, useMemo } from "react";
import { useArkpadContext } from "../editor/context";
import { cn } from "../../utils/utils";

interface StudioBlockLibraryProps {
  className?: string;
}

const DEFAULT_BLOCKS = [
  {
    id: "section",
    name: "Section",
    type: "section",
    icon: "M4 6h16M4 12h16M4 18h16",
    category: "Layout",
    attrs: { padding: "0", backgroundColor: "transparent" },
    content: [{ type: "paragraph", content: [{ type: "text", text: "Section content" }] }],
  },
  {
    id: "container",
    name: "Container",
    type: "container",
    icon: "M4 4h16v16H4z",
    category: "Layout",
    attrs: { maxWidth: "1200px", padding: "0" },
  },
  {
    id: "columns",
    name: "Columns",
    type: "columns",
    icon: "M4 4h7v16H4V4zm9 0h7v16h-7V4z",
    category: "Layout",
    attrs: { columns: 2 },
  },
  {
    id: "grid",
    name: "Grid",
    type: "grid",
    icon: "M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
    category: "Layout",
    attrs: { columns: 3 },
  },
  {
    id: "spacer",
    name: "Spacer",
    type: "spacer",
    icon: "M6 4v16M18 4v16",
    category: "Layout",
    attrs: { height: "40px" },
  },
  {
    id: "divider",
    name: "Divider",
    type: "divider",
    icon: "M4 12h16",
    category: "Layout",
    attrs: {},
  },
  {
    id: "heading",
    name: "Heading",
    type: "heading",
    icon: "M4 4h16v4H4V4zm0 6h16v4H4v-4zm0 6h12v4H4v-4z",
    category: "Typography",
    attrs: { level: 1 },
    content: [{ type: "text", text: "Heading Text" }],
  },
  {
    id: "paragraph",
    name: "Paragraph",
    type: "paragraph",
    icon: "M4 4h16v2H4V4zm0 5h16v2H4V9zm0 5h16v2H4v-2zm0 5h10v2H4v-2z",
    category: "Typography",
    content: [{ type: "text", text: "Add your text here..." }],
  },
  {
    id: "blockquote",
    name: "Quote",
    type: "blockquote",
    icon: "M4 4h8v8H4zM12 4h8v8h-8z",
    category: "Typography",
    content: [{ type: "paragraph" }],
  },
  {
    id: "codeBlock",
    name: "Code",
    type: "code_block",
    icon: "M4 4l4 4-4 4M12 4l4 4-4 4",
    category: "Typography",
    content: [],
  },
  {
    id: "button",
    name: "Button",
    type: "button",
    icon: "M4 7h16v10H4V7z",
    category: "Components",
    attrs: { text: "Click me" },
    content: [{ type: "text", text: "Click me" }],
  },
  {
    id: "card",
    name: "Card",
    type: "card",
    icon: "M4 4h16v16H4z",
    category: "Components",
    attrs: { title: "Card Title" },
    content: [{ type: "paragraph", content: [{ type: "text", text: "Card content..." }] }],
  },
  {
    id: "alert",
    name: "Alert",
    type: "alert",
    icon: "M12 2L2 22h20L12 2zM12 8v4M12 16h.01",
    category: "Components",
    attrs: { variant: "info", title: "Notice" },
    content: [{ type: "paragraph", content: [{ type: "text", text: "Alert message..." }] }],
  },
  {
    id: "image",
    name: "Image",
    type: "image",
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h14a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
    category: "Media",
    attrs: {},
  },
  {
    id: "video",
    name: "Video",
    type: "video",
    icon: "M4 4l16 8-16 8z",
    category: "Media",
    attrs: { src: "" },
  },
  {
    id: "bulletList",
    name: "Bullet List",
    type: "bulletList",
    icon: "M4 4h4v4H4zM4 10h4v4H4zM4 16h4v4H4zM10 4h10v2H10zM10 10h10v2H10zM10 16h10v2H10z",
    category: "Typography",
    attrs: {},
    content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
  },
  {
    id: "orderedList",
    name: "Numbered List",
    type: "orderedList",
    icon: "M4 4h4v4H4zM4 10h4v4H4zM4 16h4v4H4zM10 4h10v2H10zM10 10h10v2H10zM10 16h10v2H10z",
    category: "Typography",
    attrs: {},
    content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
  },
];

export function StudioBlockLibrary({ className }: StudioBlockLibraryProps) {
  const editor = useArkpadContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    if (editor?.blockRegistry) {
      editor.blockRegistry.getAllBlocks();
    }
  }, [editor]);

  const filteredBlocks = useMemo(() => {
    let blocks = DEFAULT_BLOCKS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      blocks = blocks.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.type.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query)
      );
    }

    if (activeCategory) {
      blocks = blocks.filter((b) => b.category === activeCategory);
    }

    return blocks;
  }, [searchQuery, activeCategory]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(DEFAULT_BLOCKS.map((b) => b.category)));
    return cats;
  }, []);

  const handleDragStart = (e: React.DragEvent, item: any) => {
    const dragData = {
      type: item.type,
      attrs: item.attrs || {},
      content: item.content,
    };

    if (item.type === "section") {
      e.dataTransfer.setData("application/arkpad-type-section", "true");
    }

    e.dataTransfer.setData("application/arkpad-block", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";

    const ghost = document.createElement("div");
    ghost.className =
      "fixed top-[-1000px] left-[-1000px] px-4 py-2 bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-2xl pointer-events-none flex items-center gap-2 border border-blue-400";
    ghost.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${item.icon}"/></svg> ${item.name}`;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);

    setTimeout(() => {
      if (document.body.contains(ghost)) {
        document.body.removeChild(ghost);
      }
    }, 0);
  };

  const handleManualClick = (item: any) => {
    if (!editor) return;

    if (item.type === "section") {
      editor.commands.setSection();
    } else if (item.type === "columns") {
      editor.commands.setColumns(item.attrs);
    } else if (item.type === "grid") {
      editor
        .chain()
        .insertContent({
          type: item.type,
          attrs: item.attrs,
          content: item.content,
        })
        .run();
    } else if (item.type === "container" || item.type === "card" || item.type === "alert") {
      editor
        .chain()
        .insertContent({
          type: item.type,
          attrs: item.attrs,
          content: item.content,
        })
        .run();
    } else {
      editor
        .chain()
        .insertContent({
          type: item.type,
          attrs: item.attrs,
          content: item.content || undefined,
        })
        .run();
    }
  };


  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white dark:bg-[#0A0A0A] border-r border-neutral-200 dark:border-neutral-900 select-none font-sans overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="h-14 px-4 flex items-center border-b border-neutral-100 dark:border-neutral-900 bg-neutral-50/50 dark:bg-neutral-900/50">
        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.1em]">
          Elements
        </span>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-neutral-100 dark:border-neutral-900">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[12px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-2 border-b border-neutral-100 dark:border-neutral-900 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn(
            "px-3 py-1.5 text-[10px] font-medium rounded-md whitespace-nowrap transition-all",
            activeCategory === null
              ? "bg-blue-500 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 text-[10px] font-medium rounded-md whitespace-nowrap transition-all",
              activeCategory === cat
                ? "bg-blue-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blocks Grid */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        {filteredBlocks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[12px] text-neutral-400">No blocks found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredBlocks.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleManualClick(item)}
                className="group flex flex-col items-center justify-center aspect-square bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 cursor-grab active:cursor-grabbing transition-all duration-200"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 group-hover:border-blue-500/30 group-hover:text-blue-500 transition-colors shadow-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={item.icon} />
                  </svg>
                </div>
                <span className="mt-2 text-[10px] font-medium text-neutral-600 dark:text-neutral-400 group-hover:text-blue-500 transition-colors">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50/30 dark:bg-neutral-900/20">
        <p className="text-[9px] text-neutral-400 dark:text-neutral-600 text-center">
          Drag or click to add
        </p>
      </div>
    </div>
  );
}

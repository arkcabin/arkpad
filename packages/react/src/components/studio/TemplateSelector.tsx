import React, { useState } from "react";
import { cn } from "../../utils/utils";

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: any;
}

const TEMPLATES: PageTemplate[] = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch",
    category: "Basic",
    content: {
      type: "doc",
      attrs: { title: "Untitled Page", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "60px 0", backgroundColor: "transparent" },
          content: [{ type: "paragraph", content: [{ type: "text", text: "Start typing..." }] }],
        },
      ],
    },
  },
  {
    id: "hero",
    name: "Hero Section",
    description: "Full-width hero with CTA",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Hero Page", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "100px 0", backgroundColor: "#f8fafc" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "800px", padding: "0 20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 1 },
                  content: [{ type: "text", text: "Build Something Amazing" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Create beautiful, interactive pages with our powerful drag-and-drop builder.",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "features",
    name: "Features Grid",
    description: "3-column feature showcase",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Features", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0", backgroundColor: "transparent" },
          content: [
            {
              type: "container",
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Features" }],
                },
                { type: "grid", attrs: { columns: 3, gap: "40px" }, content: [] },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "pricing",
    name: "Pricing Table",
    description: "3-tier pricing cards",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Pricing", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0", backgroundColor: "transparent" },
          content: [
            {
              type: "heading",
              attrs: { level: 2 },
              content: [{ type: "text", text: "Pricing Plans" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "about",
    name: "About Us",
    description: "Team and company info",
    category: "Pages",
    content: {
      type: "doc",
      attrs: { title: "About Us", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0" },
          content: [
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "About Us" }] },
          ],
        },
      ],
    },
  },
  {
    id: "contact",
    name: "Contact Page",
    description: "Contact form and info",
    category: "Pages",
    content: {
      type: "doc",
      attrs: { title: "Contact", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0" },
          content: [
            {
              type: "heading",
              attrs: { level: 1 },
              content: [{ type: "text", text: "Get in Touch" }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "footer",
    name: "Footer",
    description: "Multi-column site footer",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Footer", theme: "dark", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "60px 0", backgroundColor: "#1e293b" },
          content: [{ type: "grid", attrs: { columns: 4 }, content: [] }],
        },
      ],
    },
  },
];

interface TemplateSelectorProps {
  onSelect: (template: PageTemplate) => void;
  className?: string;
}

export function TemplateSelector({ onSelect, className }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));

  const filteredTemplates = TEMPLATES.filter((t) => {
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-[#0A0A0A]", className)}>
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        <h2 className="text-[14px] font-semibold text-neutral-900 dark:text-white mb-3">
          Templates
        </h2>
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
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-[12px] bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="flex gap-2 p-3 overflow-x-auto border-b border-neutral-200 dark:border-neutral-800 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-3 py-1.5 text-[11px] font-medium rounded-md whitespace-nowrap",
            !selectedCategory
              ? "bg-blue-500 text-white"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-3 py-1.5 text-[11px] font-medium rounded-md whitespace-nowrap",
              selectedCategory === cat
                ? "bg-blue-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className="flex flex-col p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-blue-500/50 hover:bg-blue-50/30 transition-all text-left"
            >
              <div className="w-full h-16 bg-neutral-200 dark:bg-neutral-700 rounded mb-2 flex items-center justify-center">
                <span className="text-[10px] text-neutral-500">{template.category}</span>
              </div>
              <span className="text-[12px] font-semibold text-neutral-900 dark:text-white">
                {template.name}
              </span>
              <span className="text-[10px] text-neutral-500 mt-0.5">{template.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TemplateSelector;

import React from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { Sun, Moon } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
}

export function Sidebar({ isCollapsed }: SidebarProps) {
  const sections = [
    {
      title: "PLATFORM",
      items: [{ name: "Full Editor", path: "/" }],
    },
    {
      title: "MARKS",
      items: [
        { name: "Bold", path: "/extensions/bold" },
        { name: "Italic", path: "/extensions/italic" },
        { name: "Underline", path: "/extensions/underline" },
        { name: "Strike", path: "/extensions/strike" },
        { name: "Code", path: "/extensions/code" },
        { name: "Superscript", path: "/extensions/superscript" },
        { name: "Subscript", path: "/extensions/subscript" },
      ],
    },
    {
      title: "NODES",
      items: [
        { name: "Table", path: "/extensions/table" },
        { name: "Heading 🚧", path: "#" },
        { name: "Blockquote 🚧", path: "#" },
        { name: "CodeBlock 🚧", path: "#" },
        { name: "Image 🚧", path: "#" },
      ],
    },
    {
      title: "UTILITIES",
      items: [
        { name: "Placeholder", path: "#" },
      ],
    },
  ];

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("arkpad-theme", isDark ? "dark" : "light");
  };

  return (
    <aside
      className={cn(
        "h-screen bg-[var(--bg-main)] border-r border-[var(--border)] flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-12" : "w-56"
      )}
    >
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6 scrollbar-hide">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                {section.title}
              </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-1.5 text-sm rounded-none transition-colors",
                    isActive && item.path !== "#"
                      ? "bg-[var(--selection)] text-[var(--text-main)] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text-main)]",
                    item.path === "#" && "cursor-default opacity-60 hover:text-[var(--text-muted)]"
                  )
                }
                onClick={(e) => {
                  if (item.path === "#") e.preventDefault();
                }}
              >
                {item.name}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-[var(--border)]">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center p-2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
        >
          <Sun className="w-4 h-4 dark:hidden" />
          <Moon className="w-4 h-4 hidden dark:block" />
        </button>
      </div>
    </aside>
  );
}

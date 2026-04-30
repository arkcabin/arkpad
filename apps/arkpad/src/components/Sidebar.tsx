import React from "react";
import { 
  Bold, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  AppWindow
} from "lucide-react";

export type ViewType = "main" | "bold";

interface SidebarProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ currentView, setView, isCollapsed, setIsCollapsed }: SidebarProps) {
  const items = [
    { id: "main", label: "Full Editor", icon: AppWindow, description: "All features active" },
    { id: "bold", label: "Bold Isolated", icon: Bold, description: "Only Bold extension" },
  ] as const;

  return (
    <aside 
      className={`bg-white dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-900">
        {!isCollapsed && (
          <span className="font-black tracking-tighter text-xl text-brand">ARKPAD</span>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-grow p-2 space-y-1">
        <div className={`px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${isCollapsed ? "text-center" : ""}`}>
          {isCollapsed ? "•" : "Navigation"}
        </div>
        
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
              currentView === item.id 
                ? "bg-brand/10 text-brand font-semibold" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <div className="text-left">
                <div className="text-sm leading-none">{item.label}</div>
                <div className="text-[10px] opacity-60 font-normal mt-1">{item.description}</div>
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-900">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
            <Settings className="w-4 h-4 text-slate-500" />
          </div>
          {!isCollapsed && (
            <div className="text-xs">
              <div className="font-semibold text-slate-900 dark:text-slate-100">Lab Mode</div>
              <div className="text-slate-500 text-[10px]">v1.6.13-stable</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

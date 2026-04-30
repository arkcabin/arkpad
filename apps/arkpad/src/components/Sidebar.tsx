import React from "react";
import { 
  Bold, 
  ChevronLeft, 
  ChevronRight,
  AppWindow,
  FlaskConical
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
      className={`relative h-screen bg-slate-50 dark:bg-[#050505] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-black text-xl">A</div>
            <span className="font-bold tracking-tight text-slate-900 dark:text-white uppercase text-sm">Arkpad Lab</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors text-slate-500 ${isCollapsed ? "mx-auto" : ""}`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-grow p-3 space-y-1.5 overflow-y-auto">
        {!isCollapsed && (
          <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Environments
          </div>
        )}
        
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
              currentView === item.id 
                ? "bg-brand text-white shadow-lg shadow-brand/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <item.icon className={`w-5 h-5 flex-shrink-0 ${currentView === item.id ? "text-white" : "group-hover:text-brand transition-colors"}`} />
            {!isCollapsed && (
              <div className="text-left">
                <div className="text-sm font-semibold leading-none">{item.label}</div>
                <div className={`text-[10px] mt-1 ${currentView === item.id ? "text-white/70" : "text-slate-500"}`}>
                  {item.description}
                </div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-black/20">
        <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
            <FlaskConical className="w-4 h-4 text-brand" />
          </div>
          {!isCollapsed && (
            <div className="text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tighter">Lab Mode</div>
              <div className="text-slate-500 text-[9px] font-mono">v1.6.13-STABLE</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

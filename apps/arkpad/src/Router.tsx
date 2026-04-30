import React, { useState } from "react";
import { App } from "./App";
import { BoldDemo } from "./demos/BoldDemo";
import { Sidebar, ViewType } from "./components/Sidebar";

export function Router() {
  const [view, setView] = useState<ViewType>("main");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-slate-100">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      <main className="flex-1 h-full overflow-hidden relative flex flex-col">
        {view === "main" ? (
          <div className="flex-1 overflow-y-auto">
            <App />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden">
            <BoldDemo />
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState } from "react";
import { App } from "./App";
import { BoldDemo } from "./demos/BoldDemo";
import { Sidebar, ViewType } from "./components/Sidebar";

export function Router() {
  const [view, setView] = useState<ViewType>("main");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black">
      <Sidebar 
        currentView={view} 
        setView={setView} 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
      />
      
      <main className="flex-grow overflow-hidden relative">
        {view === "main" ? (
          <div className="h-full w-full overflow-y-auto">
            <App />
          </div>
        ) : (
          <div className="h-full w-full overflow-hidden">
            <BoldDemo />
          </div>
        )}
      </main>
    </div>
  );
}

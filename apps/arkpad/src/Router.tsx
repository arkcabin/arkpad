import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { App } from "./App";
import { BoldDemo } from "./demos/BoldDemo";
import { TableDemo } from "./demos/TableDemo";
import { Sidebar } from "./components/Sidebar";

export function Router() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased">
        <Sidebar 
          isCollapsed={isCollapsed} 
          setIsCollapsed={setIsCollapsed} 
        />
        
        <main className="flex-1 h-full overflow-hidden relative flex flex-col">
          <Routes>
            <Route path="/" element={
              <div className="flex-1 overflow-y-auto">
                <App />
              </div>
            } />
            
            <Route path="/extensions/bold" element={
              <div className="flex-1 overflow-hidden">
                <BoldDemo />
              </div>
            } />

            <Route path="/extensions/table" element={
              <div className="flex-1 overflow-hidden">
                <TableDemo />
              </div>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

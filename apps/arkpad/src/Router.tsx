import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { App } from "./App";
import { BoldDemo } from "./demos/BoldDemo";
import { ItalicDemo } from "./demos/ItalicDemo";
import { UnderlineDemo } from "./demos/UnderlineDemo";
import { Sidebar } from "./components/Sidebar";

export function Router() {
  return (
    <BrowserRouter>
      <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-slate-100 font-sans antialiased">
        <Sidebar 
          isCollapsed={false} 
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

            <Route path="/extensions/italic" element={
              <div className="flex-1 overflow-hidden">
                <ItalicDemo />
              </div>
            } />



            <Route path="/extensions/underline" element={
              <div className="flex-1 overflow-hidden">
                <UnderlineDemo />
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

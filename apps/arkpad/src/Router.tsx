import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";

// Lazy load components for route-based loading states
const App = lazy(() => import("./App").then(m => ({ default: m.App })));
const BoldDemo = lazy(() => import("./demos/BoldDemo").then(m => ({ default: m.BoldDemo })));
const ItalicDemo = lazy(() => import("./demos/ItalicDemo").then(m => ({ default: m.ItalicDemo })));
const UnderlineDemo = lazy(() => import("./demos/UnderlineDemo").then(m => ({ default: m.UnderlineDemo })));
const StrikeDemo = lazy(() => import("./demos/StrikeDemo").then(m => ({ default: m.StrikeDemo })));
const CodeDemo = lazy(() => import("./demos/CodeDemo").then(m => ({ default: m.CodeDemo })));
const SuperscriptDemo = lazy(() => import("./demos/SuperscriptDemo").then(m => ({ default: m.SuperscriptDemo })));
const SubscriptDemo = lazy(() => import("./demos/SubscriptDemo").then(m => ({ default: m.SubscriptDemo })));

/**
 * A simple, clean loader component.
 */
function Loader() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--text-main)] rounded-full animate-spin" />
    </div>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden">
        <Sidebar isCollapsed={false} />
        
        <main className="flex-1 h-full overflow-hidden relative flex flex-col">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<div className="flex-1 overflow-y-auto"><App /></div>} />
              <Route path="/extensions/bold" element={<div className="flex-1 overflow-hidden"><BoldDemo /></div>} />
              <Route path="/extensions/italic" element={<div className="flex-1 overflow-hidden"><ItalicDemo /></div>} />
              <Route path="/extensions/underline" element={<div className="flex-1 overflow-hidden"><UnderlineDemo /></div>} />
              <Route path="/extensions/strike" element={<div className="flex-1 overflow-hidden"><StrikeDemo /></div>} />
              <Route path="/extensions/code" element={<div className="flex-1 overflow-hidden"><CodeDemo /></div>} />
              <Route path="/extensions/superscript" element={<div className="flex-1 overflow-hidden"><SuperscriptDemo /></div>} />
              <Route path="/extensions/subscript" element={<div className="flex-1 overflow-hidden"><SubscriptDemo /></div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

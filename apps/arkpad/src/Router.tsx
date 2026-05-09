import React, { Suspense, lazy, useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { cn } from "./lib/utils";
import { Edit3, Eye, Monitor, Smartphone, Tablet } from "lucide-react";

// Types
export type DeviceType = "desktop" | "tablet" | "mobile";

interface StudioContextType {
  device: DeviceType;
  setDevice: (device: DeviceType) => void;
  previewMode: boolean;
  setPreviewMode: (preview: boolean) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isPropertyPanelOpen: boolean;
  setPropertyPanelOpen: (open: boolean) => void;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

export function useStudio() {
  const context = useContext(StudioContext);
  if (!context) throw new Error("useStudio must be used within StudioProvider");
  return context;
}

// Lazy load components
const BoldDemo = lazy(() => import("./demos/BoldDemo").then((m) => ({ default: m.BoldDemo })));
const ItalicDemo = lazy(() => import("./demos/ItalicDemo").then((m) => ({ default: m.ItalicDemo })));
const UnderlineDemo = lazy(() => import("./demos/UnderlineDemo").then((m) => ({ default: m.UnderlineDemo })));
const StrikeDemo = lazy(() => import("./demos/StrikeDemo").then((m) => ({ default: m.StrikeDemo })));
const CodeDemo = lazy(() => import("./demos/CodeDemo").then((m) => ({ default: m.CodeDemo })));
const SuperscriptDemo = lazy(() => import("./demos/SuperscriptDemo").then((m) => ({ default: m.SuperscriptDemo })));
const SubscriptDemo = lazy(() => import("./demos/SubscriptDemo").then((m) => ({ default: m.SubscriptDemo })));
const TableDemo = lazy(() => import("./demos/TableDemo").then((m) => ({ default: m.TableDemo })));
const HighlightDemo = lazy(() => import("./demos/HighlightDemo").then((m) => ({ default: m.HighlightDemo })));
const BuilderDemo = lazy(() => import("./demos/BuilderDemo").then((m) => ({ default: m.BuilderDemo })));

function Loader() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--text-main)] rounded-full animate-spin" />
    </div>
  );
}

const ROUTE_NAMES: Record<string, string> = {
  "/": "Full Editor",
  "/builder": "Page Builder",
  "/extensions/bold": "Bold",
  "/extensions/italic": "Italic",
  "/extensions/underline": "Underline",
  "/extensions/strike": "Strike",
  "/extensions/code": "Code",
  "/extensions/superscript": "Superscript",
  "/extensions/subscript": "Subscript",
  "/extensions/table": "Table",
  "/extensions/highlight": "Highlight",
};

const isBuilderPath = (pathname: string) => pathname === "/builder" || pathname === "/";

function TopBar({ onSidebarToggle }: { onSidebarToggle: () => void }) {
  const location = useLocation();
  const pageName = ROUTE_NAMES[location.pathname] || "Arkpad";
  const { 
    device, setDevice, 
    previewMode, setPreviewMode, 
    isSidebarOpen, setSidebarOpen,
    isPropertyPanelOpen, setPropertyPanelOpen 
  } = useStudio();
  
  const isBuilder = isBuilderPath(location.pathname);

  const getDeviceClass = (d: DeviceType) =>
    `p-1 rounded transition-all shadow-none hover:shadow-sm ${
      device === d ? "text-black bg-white shadow-sm" : "text-gray-400 hover:text-black hover:bg-white"
    }`;

  return (
    <div className="h-10 px-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-white z-50">
      <div className="flex items-center gap-3">
        <button onClick={onSidebarToggle} className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="4" x2="14" y2="4" /><line x1="2" y1="8" x2="14" y2="8" /><line x1="2" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-[10px] font-medium tracking-tight">
          <span className="text-[var(--text-muted)] hover:text-[var(--text-main)]">Pages</span>
          <span className="text-[var(--text-muted)] opacity-30">/</span>
          <span className="text-[var(--text-main)] font-semibold">{pageName}</span>
        </div>
      </div>

      {isBuilder && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100/50 p-0.5 rounded-lg border border-gray-200/50">
          <button onClick={() => setDevice("desktop")} className={getDeviceClass("desktop")}><Monitor size={12} /></button>
          <button onClick={() => setDevice("tablet")} className={getDeviceClass("tablet")}><Tablet size={12} /></button>
          <button onClick={() => setDevice("mobile")} className={getDeviceClass("mobile")}><Smartphone size={12} /></button>
        </div>
      )}

      {isBuilder && (
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100/50 p-0.5 rounded-lg border border-gray-200/50">
            <button onClick={() => setPreviewMode(false)} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold ${!previewMode ? "bg-white text-black shadow-sm ring-1 ring-black/5" : "text-gray-400"}`}>
              <Edit3 size={11} /> EDIT
            </button>
            <button onClick={() => setPreviewMode(true)} className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold ${previewMode ? "bg-white text-black shadow-sm ring-1 ring-black/5" : "text-gray-400"}`}>
              <Eye size={11} /> PREVIEW
            </button>
          </div>
          <div className="w-px h-4 bg-[var(--border)]" />
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={cn("p-1", isSidebarOpen ? "text-black" : "text-gray-400")}><BoxIcon /></button>
          <button onClick={() => setPropertyPanelOpen(!isPropertyPanelOpen)} className={cn("p-1", isPropertyPanelOpen ? "text-black" : "text-gray-400")}><LayoutIcon /></button>
        </div>
      )}
    </div>
  );
}

const BoxIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="1" /><line x1="7" y1="2" x2="7" y2="14" />
  </svg>
);

const LayoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="12" height="12" rx="1" /><line x1="9" y1="2" x2="9" y2="14" />
  </svg>
);

export function Router() {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [previewMode, setPreviewMode] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isPropertyPanelOpen, setPropertyPanelOpen] = useState(false);

  return (
    <BrowserRouter>
      <StudioContext.Provider value={{ 
        device, setDevice, previewMode, setPreviewMode, 
        isSidebarOpen, setSidebarOpen, isPropertyPanelOpen, setPropertyPanelOpen 
      }}>
        <AppShell />
      </StudioContext.Provider>
    </BrowserRouter>
  );
}

function AppShell() {
  const [navSidebarOpen, setNavSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden">
      {navSidebarOpen && <Sidebar isCollapsed={false} />}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar onSidebarToggle={() => setNavSidebarOpen(!navSidebarOpen)} />
        <main className="flex-1 h-full overflow-hidden relative flex flex-col">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<div className="flex-1 overflow-hidden"><BuilderDemo /></div>} />
              <Route path="/builder" element={<div className="flex-1 overflow-hidden"><BuilderDemo /></div>} />
              <Route path="/extensions/bold" element={<BoldDemo />} />
              <Route path="/extensions/italic" element={<ItalicDemo />} />
              <Route path="/extensions/underline" element={<UnderlineDemo />} />
              <Route path="/extensions/strike" element={<StrikeDemo />} />
              <Route path="/extensions/code" element={<CodeDemo />} />
              <Route path="/extensions/superscript" element={<SuperscriptDemo />} />
              <Route path="/extensions/subscript" element={<SubscriptDemo />} />
              <Route path="/extensions/table" element={<TableDemo />} />
              <Route path="/extensions/highlight" element={<HighlightDemo />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

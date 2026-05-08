import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { BuilderNavProvider, useBuilderNav } from "./lib/BuilderNavContext";
import { Edit3, Eye, Monitor, Smartphone, Tablet } from "lucide-react";

// Lazy load components for route-based loading states
const BoldDemo = lazy(() => import("./demos/BoldDemo").then((m) => ({ default: m.BoldDemo })));
const ItalicDemo = lazy(() =>
  import("./demos/ItalicDemo").then((m) => ({ default: m.ItalicDemo }))
);
const UnderlineDemo = lazy(() =>
  import("./demos/UnderlineDemo").then((m) => ({ default: m.UnderlineDemo }))
);
const StrikeDemo = lazy(() =>
  import("./demos/StrikeDemo").then((m) => ({ default: m.StrikeDemo }))
);
const CodeDemo = lazy(() => import("./demos/CodeDemo").then((m) => ({ default: m.CodeDemo })));
const SuperscriptDemo = lazy(() =>
  import("./demos/SuperscriptDemo").then((m) => ({ default: m.SuperscriptDemo }))
);
const SubscriptDemo = lazy(() =>
  import("./demos/SubscriptDemo").then((m) => ({ default: m.SubscriptDemo }))
);
const TableDemo = lazy(() => import("./demos/TableDemo").then((m) => ({ default: m.TableDemo })));
const HighlightDemo = lazy(() =>
  import("./demos/HighlightDemo").then((m) => ({ default: m.HighlightDemo }))
);
const BuilderDemo = lazy(() =>
  import("./demos/BuilderDemo").then((m) => ({ default: m.BuilderDemo }))
);

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

// Helper to determine if we're in builder mode
const isBuilderPath = (pathname: string) => pathname === "/builder" || pathname === "/";

type DeviceType = "desktop" | "tablet" | "mobile";

function TopBar({
  sidebarOpen,
  onToggle,
  device,
  onDeviceChange,
}: {
  sidebarOpen: boolean;
  onToggle: () => void;
  device: DeviceType;
  onDeviceChange: (d: DeviceType) => void;
}) {
  const location = useLocation();
  const pageName = ROUTE_NAMES[location.pathname] || "Arkpad";
  const { navOpen, setNavOpen, previewMode, setPreviewMode } = useBuilderNav();
  const isBuilder = isBuilderPath(location.pathname);

  const getDeviceClass = (d: DeviceType) =>
    `p-1 rounded transition-all shadow-none hover:shadow-sm ${
      device === d
        ? "text-black bg-white shadow-sm"
        : "text-gray-400 hover:text-black hover:bg-white"
    }`;

  return (
    <div className="h-10 px-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="14" y2="8" />
            <line x1="2" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-[10px] font-medium tracking-tight">
          <span className="text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer">
            Pages
          </span>
          <span className="text-[var(--text-muted)] opacity-30">/</span>
          <span className="text-[var(--text-main)] font-semibold">{pageName}</span>
        </div>
      </div>

      {isBuilder && (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-gray-100/50 p-0.5 rounded-lg border border-gray-200/50">
          <button
            onClick={() => onDeviceChange("desktop")}
            className={getDeviceClass("desktop")}
            title="Desktop View"
          >
            <Monitor size={12} />
          </button>
          <button
            onClick={() => onDeviceChange("tablet")}
            className={getDeviceClass("tablet")}
            title="Tablet View"
          >
            <Tablet size={12} />
          </button>
          <button
            onClick={() => onDeviceChange("mobile")}
            className={getDeviceClass("mobile")}
            title="Mobile View"
          >
            <Smartphone size={12} />
          </button>
        </div>
      )}

      {isBuilder && (
        <div className="flex items-center gap-4">
          {/* Minimalist Mode Toggle */}
          <div className="flex bg-gray-100/50 p-0.5 rounded-lg border border-gray-200/50">
            <button
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
                !previewMode
                  ? "bg-white text-black shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Edit3 size={11} />
              EDIT
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
                previewMode
                  ? "bg-white text-black shadow-sm ring-1 ring-black/5"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Eye size={11} />
              PREVIEW
            </button>
          </div>

          <div className="w-px h-4 bg-[var(--border)]" />

          <button
            onClick={() => setNavOpen(!navOpen)}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            title={navOpen ? "Hide blocks panel" : "Show blocks panel"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="12" height="12" rx="1" />
              <line x1="10" y1="2" x2="10" y2="14" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <BuilderNavProvider>
        <AppShell />
      </BuilderNavProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [device, setDevice] = React.useState<DeviceType>("desktop");

  // Compute max-width based on device
  const deviceMaxWidth = device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%";

  return (
    <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden">
      {sidebarOpen && <Sidebar isCollapsed={false} />}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopBar
          sidebarOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          device={device}
          onDeviceChange={setDevice}
        />

        <main className="flex-1 h-full overflow-hidden relative flex flex-col">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="flex-1 overflow-hidden">
                    <BuilderDemo maxWidth={deviceMaxWidth} />
                  </div>
                }
              />
              <Route
                path="/extensions/bold"
                element={
                  <div className="flex-1 overflow-hidden">
                    <BoldDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/italic"
                element={
                  <div className="flex-1 overflow-hidden">
                    <ItalicDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/underline"
                element={
                  <div className="flex-1 overflow-hidden">
                    <UnderlineDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/strike"
                element={
                  <div className="flex-1 overflow-hidden">
                    <StrikeDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/code"
                element={
                  <div className="flex-1 overflow-hidden">
                    <CodeDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/superscript"
                element={
                  <div className="flex-1 overflow-hidden">
                    <SuperscriptDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/subscript"
                element={
                  <div className="flex-1 overflow-hidden">
                    <SubscriptDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/table"
                element={
                  <div className="flex-1 overflow-hidden">
                    <TableDemo />
                  </div>
                }
              />
              <Route
                path="/extensions/highlight"
                element={
                  <div className="flex-1 overflow-hidden">
                    <HighlightDemo />
                  </div>
                }
              />
              <Route
                path="/builder"
                element={
                  <div className="flex-1 overflow-hidden">
                    <BuilderDemo />
                  </div>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

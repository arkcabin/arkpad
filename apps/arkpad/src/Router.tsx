import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { BuilderNavProvider, useBuilderNav } from "./lib/BuilderNavContext";

// Lazy load components for route-based loading states
const App = lazy(() => import("./App").then((m) => ({ default: m.App })));
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

function TopBar({ sidebarOpen, onToggle }: { sidebarOpen: boolean; onToggle: () => void }) {
  const location = useLocation();
  const pageName = ROUTE_NAMES[location.pathname] || "Arkpad";
  const { navOpen, setNavOpen } = useBuilderNav();
  const isBuilder = location.pathname === "/builder";

  return (
    <div className="h-10 px-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="4" x2="14" y2="4" />
            <line x1="2" y1="8" x2="14" y2="8" />
            <line x1="2" y1="12" x2="14" y2="12" />
          </svg>
        </button>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {pageName}
        </span>
      </div>

      {isBuilder && (
        <button
          onClick={() => setNavOpen(!navOpen)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          title={navOpen ? "Hide blocks panel" : "Show blocks panel"}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <line x1="10" y1="2" x2="10" y2="14" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function Router() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <BrowserRouter>
      <BuilderNavProvider>
        <div className="flex h-screen bg-[var(--bg-main)] overflow-hidden">
        {sidebarOpen && <Sidebar isCollapsed={false} />}

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <TopBar sidebarOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

          <main className="flex-1 h-full overflow-hidden relative flex flex-col">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route
                path="/"
                element={
                  <div className="flex-1 overflow-y-auto">
                    <App />
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
      </BuilderNavProvider>
    </BrowserRouter>
  );
}

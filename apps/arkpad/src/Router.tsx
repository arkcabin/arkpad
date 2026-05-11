import React, { Suspense, lazy, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";

// Lazy load components
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
const HeadingDemo = lazy(() =>
  import("./demos/HeadingDemo").then((m) => ({ default: m.HeadingDemo }))
);
const BlockquoteDemo = lazy(() =>
  import("./demos/BlockquoteDemo").then((m) => ({ default: m.BlockquoteDemo }))
);
const CodeBlockDemo = lazy(() =>
  import("./demos/CodeBlockDemo").then((m) => ({ default: m.CodeBlockDemo }))
);
const HorizontalRuleDemo = lazy(() =>
  import("./demos/HorizontalRuleDemo").then((m) => ({ default: m.HorizontalRuleDemo }))
);
const StandardEditor = lazy(() =>
  import("./demos/StandardEditor").then((m) => ({ default: m.StandardEditor }))
);

function Loader() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[var(--border)] border-t-[var(--text-main)] rounded-full animate-spin" />
    </div>
  );
}

const ROUTE_NAMES: Record<string, string> = {
  "/": "Standard Editor",
  "/extensions/bold": "Bold",
  "/extensions/italic": "Italic",
  "/extensions/underline": "Underline",
  "/extensions/strike": "Strike",
  "/extensions/code": "Code",
  "/extensions/superscript": "Superscript",
  "/extensions/subscript": "Subscript",
  "/extensions/table": "Table",
  "/extensions/highlight": "Highlight",
  "/extensions/heading": "Heading",
  "/extensions/blockquote": "Blockquote",
  "/extensions/codeblock": "CodeBlock",
  "/extensions/horizontal-rule": "Horizontal Rule",
};

function TopBar({ onSidebarToggle }: { onSidebarToggle: () => void }) {
  const location = useLocation();
  const pageName = ROUTE_NAMES[location.pathname] || "Arkpad";

  return (
    <div className="h-10 px-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-white z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onSidebarToggle}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
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
          <span className="text-[var(--text-muted)] hover:text-[var(--text-main)]">Editor</span>
          <span className="text-[var(--text-muted)] opacity-30">/</span>
          <span className="text-[var(--text-main)] font-semibold">{pageName}</span>
        </div>
      </div>
    </div>
  );
}

export function Router() {
  return (
    <BrowserRouter>
      <AppShell />
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
              <Route
                path="/"
                element={
                  <div className="flex-1 overflow-hidden">
                    <StandardEditor />
                  </div>
                }
              />
              <Route path="/extensions/bold" element={<BoldDemo />} />
              <Route path="/extensions/italic" element={<ItalicDemo />} />
              <Route path="/extensions/underline" element={<UnderlineDemo />} />
              <Route path="/extensions/strike" element={<StrikeDemo />} />
              <Route path="/extensions/code" element={<CodeDemo />} />
              <Route path="/extensions/superscript" element={<SuperscriptDemo />} />
              <Route path="/extensions/subscript" element={<SubscriptDemo />} />
              <Route path="/extensions/table" element={<TableDemo />} />
              <Route path="/extensions/highlight" element={<HighlightDemo />} />
              <Route path="/extensions/heading" element={<HeadingDemo />} />
              <Route path="/extensions/blockquote" element={<BlockquoteDemo />} />
              <Route path="/extensions/codeblock" element={<CodeBlockDemo />} />
              <Route path="/extensions/horizontal-rule" element={<HorizontalRuleDemo />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

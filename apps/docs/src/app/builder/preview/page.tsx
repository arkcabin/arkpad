"use client";

import React, { useState, useEffect } from "react";
import { Render, NormalizedPageConfig } from "../../../../../../packages/builder/src";
import { registerDefaultBlocks } from "@arkpad/builder-blocks";
import Link from "next/link";
import { ChevronLeft, RefreshCw, Eye } from "lucide-react";

// Register layout blocks on load
registerDefaultBlocks();

export default function PreviewPage() {
  const [layout, setLayout] = useState<NormalizedPageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Load layout from LocalStorage and listen for changes across other tabs
  useEffect(() => {
    const loadLayout = () => {
      try {
        const stored = localStorage.getItem("arkpad-builder-layout");
        if (stored) {
          setLayout(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load preview layout from LocalStorage:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLayout();

    // Real-time synchronization: Update layout instantly if changed in the editor tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "arkpad-builder-layout" && e.newValue) {
        try {
          setLayout(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to parse synced layout data:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black text-neutral-500 font-sans transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-neutral-450 dark:text-neutral-500" />
          <span className="text-[10px] font-semibold tracking-wider uppercase">
            Loading Live Preview...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-50 dark:bg-neutral-900/40 text-neutral-800 dark:text-neutral-200 font-sans transition-colors duration-200">
      {/* Visual Floating Info Header */}
      <div className="sticky top-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80 px-6 py-3 flex items-center justify-between z-50">
        <Link
          href="/builder"
          className="group flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Editor
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            Live Preview Mode (Sync Active)
          </span>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="max-w-5xl mx-auto p-8 my-6 bg-white dark:bg-neutral-950 shadow-sm border border-neutral-200 dark:border-neutral-850 rounded-xl">
        {layout && layout.rootIds && layout.rootIds.length > 0 ? (
          <Render data={layout} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-450 dark:text-neutral-500">
            <Eye className="w-10 h-10 mb-4 text-neutral-300 dark:text-neutral-700" />
            <h2 className="text-sm font-bold text-neutral-800 dark:text-white">No Preview Data Found</h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-[320px] mt-1.5 leading-relaxed">
              Ensure you have the page builder open at <Link href="/builder" className="text-blue-500 hover:underline">/builder</Link> and have added components to the layout grid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { BuilderProvider, Canvas, Sidebar, useBuilder, safeValidateLayout } from "@arkpad/builder";
import { registerDefaultBlocks } from "@arkpad/builder-blocks";
import { Header } from "./components/Header";
import { initialLayout } from "./data/initialLayout";

// Register default blocks on load
registerDefaultBlocks();

// Auto-sync layout changes from Zustand state to LocalStorage so the preview tab picks it up
const LocalStorageSync = () => {
  const { layout } = useBuilder();

  React.useEffect(() => {
    if (layout) {
      localStorage.setItem("arkpad-builder-layout", JSON.stringify(layout));
    }
  }, [layout]);

  return null;
};

export default function BuilderDemoPage() {
  // Validate layout config using Zod schema prior to loading
  const validatedLayout = safeValidateLayout(initialLayout);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black text-neutral-450 dark:text-neutral-500 font-sans transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-neutral-300 dark:border-neutral-800 border-t-neutral-800 dark:border-t-white rounded-full animate-spin" />
          <span className="text-[10px] font-semibold tracking-wider uppercase animate-pulse">
            Loading Studio...
          </span>
        </div>
      </div>
    );
  }

  return (
    <BuilderProvider initialLayout={validatedLayout}>
      <LocalStorageSync />
      <div className="flex flex-col h-screen w-full bg-white dark:bg-black text-neutral-800 dark:text-neutral-200 overflow-hidden font-sans transition-colors duration-200">
        {/* Modular Premium Header */}
        <Header initialLayout={validatedLayout} />

        {/* Workspace Shell */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Visual grid Canvas */}
          <Canvas />
          
          {/* Exporter & block inspector Sidebar */}
          <Sidebar />
        </div>
      </div>
    </BuilderProvider>
  );
}

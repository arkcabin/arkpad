"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutGrid, ChevronLeft, RotateCcw, Monitor, Smartphone, Check, Sun, Moon, Undo, Redo } from "lucide-react";
import { LayoutJSON, useBuilder } from "@arkpad/builder";
import { useTheme } from "next-themes";

interface HeaderProps {
  initialLayout: LayoutJSON;
}

export const Header: React.FC<HeaderProps> = ({ initialLayout }) => {
  const { setLayout, undo, redo, past, future } = useBuilder();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [resetting, setResetting] = useState(false);

  // Sync mounting state to avoid SSR hydration mismatches with next-themes icons
  useEffect(() => {
    setMounted(true);
  }, []);

  // Global Undo / Redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        activeEl.getAttribute("contenteditable") === "true"
      );
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleReset = () => {
    setResetting(true);
    setLayout(initialLayout);
    setTimeout(() => setResetting(false), 600);
  };

  return (
    <header className="h-14 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50 sticky top-0 select-none text-neutral-800 dark:text-neutral-200 transition-colors duration-200">
      {/* Left side actions */}
      <div className="flex items-center gap-4">
        <Link
          href="/docs"
          className="group flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors duration-150"
        >
          <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          Docs
        </Link>
        
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />
        
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-none text-neutral-800 dark:text-white shadow-sm">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-tight text-neutral-850 dark:text-white">
                Arkpad Studio
              </span>
              <span className="text-[9px] px-1 py-0.5 font-bold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50">
                v1.6
              </span>
            </div>
            <span className="text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">
              Visual Grid Engine
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Canvas View Simulators */}
      <div className="hidden md:flex items-center bg-neutral-100 dark:bg-neutral-900 p-0.5 border border-neutral-200 dark:border-neutral-800 rounded-none">
        <button
          onClick={() => setDevice("desktop")}
          className={`p-1.5 rounded-none flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
            device === "desktop"
              ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/50 dark:border-neutral-700"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
          title="Simulate Desktop View"
        >
          <Monitor className="w-3.5 h-3.5" />
          Desktop
        </button>
        <button
          onClick={() => setDevice("mobile")}
          className={`p-1.5 rounded-none flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
            device === "mobile"
              ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm border border-neutral-200/50 dark:border-neutral-700"
              : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          }`}
          title="Simulate Mobile View (Responsive)"
        >
          <Smartphone className="w-3.5 h-3.5" />
          Mobile
        </button>
      </div>

      {/* Right: Layout actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggler */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-1.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-150 active:scale-95 flex items-center justify-center"
          title="Toggle Theme Mode"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
          )}
        </button>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

        {/* Undo / Redo Actions */}
        <div className="flex items-center bg-neutral-50 dark:bg-neutral-900/50 p-0.5 border border-neutral-200 dark:border-neutral-800 rounded">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-1.5 text-neutral-550 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-white disabled:opacity-30 disabled:hover:text-neutral-550 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            title={`Undo (Ctrl+Z) - ${past.length} states`}
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 text-neutral-550 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-white disabled:opacity-30 disabled:hover:text-neutral-550 transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
            title={`Redo (Ctrl+Y) - ${future.length} states`}
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

        {/* Reset Button */}
        <button
          onClick={handleReset}
          disabled={resetting}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-550 dark:text-neutral-400 hover:text-neutral-900 hover:dark:text-white text-xs font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50"
        >
          {resetting ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5 transition-transform duration-300 hover:rotate-180" />
          )}
          {resetting ? "Reset Done" : "Reset Canvas"}
        </button>

        {/* Open Live Preview Route */}
        <Link
          href="/builder/preview"
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-550 dark:text-neutral-450 hover:text-neutral-900 hover:dark:text-white text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
        >
          Open Preview ↗
        </Link>
        
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800" />

        {/* Validation Badge */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/40 px-2 py-0.5">
            <Check className="w-2.5 h-2.5 text-emerald-500 dark:text-emerald-400" />
            Schema Validated
          </div>
          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold uppercase tracking-wider">
            Layout Builder
          </div>
        </div>
      </div>
    </header>
  );
};

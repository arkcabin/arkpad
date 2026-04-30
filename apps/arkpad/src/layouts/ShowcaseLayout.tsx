import React from "react";

interface ShowcaseLayoutProps {
  category: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

export function ShowcaseLayout({ 
  category, 
  title, 
  description, 
  children 
}: ShowcaseLayoutProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-main)]">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl mx-auto px-8 py-12 space-y-12">
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{category}</div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="text-sm text-[var(--text-muted)] max-w-2xl">{description}</p>
          </div>

          <div className="border border-[var(--border)] rounded-none bg-[var(--bg-main)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useArkpadContext } from "../editor/context";

export function StudioPropertyInspector() {
  const _editor = useArkpadContext();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] border-l border-neutral-200 dark:border-neutral-800 p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">
        Properties
      </h3>
      <p className="text-[11px] text-neutral-500 italic">
        Select an element to see its properties.
      </p>
    </div>
  );
}

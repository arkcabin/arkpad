import React from "react";

import { useArkpadContext } from "../editor/context";

export function StudioPropertyInspector() {
  const editor = useArkpadContext();
  const [, setUpdate] = React.useState(0);
  const [selectedNode, setSelectedNode] = React.useState<any>(null);

  React.useEffect(() => {
    if (!editor) return;

    const updateSelection = () => {
      const state = editor.getState();
      const { selection } = state;
      if ((selection as any).node) {
        setSelectedNode((selection as any).node);
      } else {
        setSelectedNode(null);
      }
      setUpdate((u) => u + 1);
    };

    editor.events.on("selectionUpdate", updateSelection);
    editor.events.on("update", updateSelection);

    return () => {
      editor.events.off("selectionUpdate", updateSelection);
      editor.events.off("update", updateSelection);
    };
  }, [editor]);

  if (!editor) return null;

  const docAttrs = editor.getState().doc.attrs;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] border-l border-neutral-200 dark:border-neutral-800 p-5 overflow-y-auto">
      <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6">
        {selectedNode ? `Editing ${selectedNode.type.name}` : "Page Settings"}
      </h3>

      {!selectedNode ? (
        <div className="space-y-6">
          <PropertyField
            label="Page Title"
            value={docAttrs.title || ""}
            onChange={(val: string) => editor.runCommand("setDocAttributes", { title: val })}
          />
          <PropertyField
            label="Theme"
            value={docAttrs.theme || "light"}
            options={["light", "dark", "system"]}
            onChange={(val: string) => editor.runCommand("setDocAttributes", { theme: val })}
          />
          <PropertyField
            label="Max Width"
            value={docAttrs.maxWidth || "1200px"}
            onChange={(val: string) => editor.runCommand("setDocAttributes", { maxWidth: val })}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-[11px] text-neutral-500 italic">
            Adjusting {selectedNode.type.name} properties...
          </p>
        </div>
      )}
    </div>
  );
}

function PropertyField({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 text-[12px] outline-none focus:border-blue-500 transition-colors"
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 text-[12px] outline-none focus:border-blue-500 transition-colors"
        />
      )}
    </div>
  );
}

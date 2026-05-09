import React, { useState, useEffect } from "react";
import { Node } from "prosemirror-model";
import { useArkpadContext } from "../editor/context";
import { cn } from "../../utils/utils";
import { useEditorStore } from "../../stores/editorStore";

export function StudioPropertyInspector() {
  const editor = useArkpadContext();
  const selectedNode = useEditorStore((s) => s.selectedNode);
  const [activeTab, setActiveTab] = React.useState<"settings" | "layers" | "styles">("settings");

  React.useEffect(() => {
    if (!editor) return;
    useEditorStore.getState().init(editor);
    return () => useEditorStore.getState().destroy();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0A0A0A] border-l border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div className="flex border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
        <TabButton
          active={activeTab === "settings"}
          onClick={() => setActiveTab("settings")}
          label="Settings"
          icon={<SettingsIcon />}
        />
        <TabButton
          active={activeTab === "styles"}
          onClick={() => setActiveTab("styles")}
          label="Styles"
          icon={<PaletteIcon />}
        />
        <TabButton
          active={activeTab === "layers"}
          onClick={() => setActiveTab("layers")}
          label="Layers"
          icon={<LayersIcon />}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {activeTab === "settings" ? (
          <SettingsPanel editor={editor} selectedNode={selectedNode} />
        ) : activeTab === "styles" ? (
          <StylesPanel editor={editor} selectedNode={selectedNode} />
        ) : (
          <LayersPanel editor={editor} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-3 px-2 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all",
        active
          ? "text-blue-500 border-b-2 border-blue-500 bg-white dark:bg-[#0A0A0A]"
          : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 bg-transparent"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingsPanel({ editor, selectedNode }: { editor: any; selectedNode: any }) {
  const docAttrs = editor.getState().doc.attrs;

  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
        {selectedNode ? `Editing ${selectedNode.type.name}` : "Page Settings"}
      </h3>

      {!selectedNode ? (
        <div className="space-y-4">
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
        <div className="space-y-4">
          {Object.entries(selectedNode.attrs || {}).map(([key, value]) => (
            <PropertyField
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              value={String(value || "")}
              onChange={(val: string) => {
                editor
                  .chain()
                  .updateAttributes(selectedNode.type.name, { [key]: val })
                  .run();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StylesPanel({ editor, selectedNode }: { editor: any; selectedNode: any }) {
  const [styles, setStyles] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedNode?.attrs?.style) {
      try {
        const parsed =
          typeof selectedNode.attrs.style === "string"
            ? JSON.parse(selectedNode.attrs.style)
            : selectedNode.attrs.style;
        setStyles(parsed);
      } catch {
        setStyles({});
      }
    } else {
      setStyles({});
    }
  }, [selectedNode]);

  const updateStyle = (key: string, value: string) => {
    const newStyles = { ...styles, [key]: value };
    setStyles(newStyles);
    if (selectedNode) {
      editor.chain().updateAttributes(selectedNode.type.name, { style: newStyles }).run();
    }
  };

  if (!selectedNode) {
    return (
      <div className="space-y-6">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
          Global Styles
        </h3>

        <StyleSection title="Background">
          <ColorPicker
            label="Background Color"
            value={styles.backgroundColor || ""}
            onChange={(v) => updateStyle("backgroundColor", v)}
          />
          <PropertyField
            label="Background Image"
            value={styles.backgroundImage || ""}
            onChange={(v) => updateStyle("backgroundImage", v)}
          />
        </StyleSection>

        <StyleSection title="Typography">
          <PropertyField
            label="Font Family"
            value={styles.fontFamily || ""}
            onChange={(v) => updateStyle("fontFamily", v)}
          />
          <PropertyField
            label="Font Size"
            value={styles.fontSize || ""}
            onChange={(v) => updateStyle("fontSize", v)}
          />
          <PropertyField
            label="Font Weight"
            value={styles.fontWeight || ""}
            options={[
              "normal",
              "bold",
              "100",
              "200",
              "300",
              "400",
              "500",
              "600",
              "700",
              "800",
              "900",
            ]}
            onChange={(v) => updateStyle("fontWeight", v)}
          />
        </StyleSection>

        <StyleSection title="Spacing">
          <PropertyField
            label="Padding"
            value={styles.padding || ""}
            placeholder="10px or 10px 20px"
            onChange={(v) => updateStyle("padding", v)}
          />
          <PropertyField
            label="Margin"
            value={styles.margin || ""}
            placeholder="10px or 10px 20px"
            onChange={(v) => updateStyle("margin", v)}
          />
        </StyleSection>

        <StyleSection title="Border">
          <PropertyField
            label="Border Width"
            value={styles.borderWidth || ""}
            onChange={(v) => updateStyle("borderWidth", v)}
          />
          <PropertyField
            label="Border Radius"
            value={styles.borderRadius || ""}
            placeholder="4px or 50%"
            onChange={(v) => updateStyle("borderRadius", v)}
          />
          <ColorPicker
            label="Border Color"
            value={styles.borderColor || ""}
            onChange={(v) => updateStyle("borderColor", v)}
          />
        </StyleSection>

        <StyleSection title="Effects">
          <PropertyField
            label="Box Shadow"
            value={styles.boxShadow || ""}
            placeholder="0 2px 4px rgba(0,0,0,0.1)"
            onChange={(v) => updateStyle("boxShadow", v)}
          />
          <PropertyField
            label="Opacity"
            value={styles.opacity || ""}
            placeholder="0-100"
            onChange={(v) => updateStyle("opacity", v)}
          />
        </StyleSection>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
        {selectedNode.type.name} Styles
      </h3>

      <StyleSection title="Layout">
        <PropertyField
          label="Width"
          value={styles.width || ""}
          placeholder="auto, 100%, 200px"
          onChange={(v) => updateStyle("width", v)}
        />
        <PropertyField
          label="Height"
          value={styles.height || ""}
          placeholder="auto, 100%, 200px"
          onChange={(v) => updateStyle("height", v)}
        />
        <PropertyField
          label="Min Height"
          value={styles.minHeight || ""}
          placeholder="100px, 50vh"
          onChange={(v) => updateStyle("minHeight", v)}
        />
        <PropertyField
          label="Max Width"
          value={styles.maxWidth || ""}
          placeholder="1200px, 100%"
          onChange={(v) => updateStyle("maxWidth", v)}
        />
        <PropertyField
          label="Display"
          value={styles.display || ""}
          options={["block", "flex", "grid", "inline", "inline-block", "none"]}
          onChange={(v) => updateStyle("display", v)}
        />
      </StyleSection>

      <StyleSection title="Flex Layout">
        <PropertyField
          label="Flex Direction"
          value={styles.flexDirection || ""}
          options={["row", "column", "row-reverse", "column-reverse"]}
          onChange={(v) => updateStyle("flexDirection", v)}
        />
        <PropertyField
          label="Justify Content"
          value={styles.justifyContent || ""}
          options={[
            "flex-start",
            "center",
            "flex-end",
            "space-between",
            "space-around",
            "space-evenly",
          ]}
          onChange={(v) => updateStyle("justifyContent", v)}
        />
        <PropertyField
          label="Align Items"
          value={styles.alignItems || ""}
          options={["flex-start", "center", "flex-end", "stretch", "baseline"]}
          onChange={(v) => updateStyle("alignItems", v)}
        />
        <PropertyField
          label="Flex Wrap"
          value={styles.flexWrap || ""}
          options={["nowrap", "wrap", "wrap-reverse"]}
          onChange={(v) => updateStyle("flexWrap", v)}
        />
        <PropertyField
          label="Gap"
          value={styles.gap || ""}
          placeholder="8px, 16px"
          onChange={(v) => updateStyle("gap", v)}
        />
      </StyleSection>

      <StyleSection title="Spacing">
        <div className="grid grid-cols-2 gap-2">
          <PropertyField
            label="Padding T"
            value={styles.paddingTop || ""}
            placeholder="10px"
            onChange={(v) => updateStyle("paddingTop", v)}
          />
          <PropertyField
            label="Padding R"
            value={styles.paddingRight || ""}
            placeholder="10px"
            onChange={(v) => updateStyle("paddingRight", v)}
          />
          <PropertyField
            label="Padding B"
            value={styles.paddingBottom || ""}
            placeholder="10px"
            onChange={(v) => updateStyle("paddingBottom", v)}
          />
          <PropertyField
            label="Padding L"
            value={styles.paddingLeft || ""}
            placeholder="10px"
            onChange={(v) => updateStyle("paddingLeft", v)}
          />
        </div>
        <PropertyField
          label="Margin"
          value={styles.margin || ""}
          placeholder="10px or 10px 20px"
          onChange={(v) => updateStyle("margin", v)}
        />
      </StyleSection>

      <StyleSection title="Typography">
        <PropertyField
          label="Font Size"
          value={styles.fontSize || ""}
          placeholder="16px"
          onChange={(v) => updateStyle("fontSize", v)}
        />
        <PropertyField
          label="Font Weight"
          value={styles.fontWeight || ""}
          options={[
            "normal",
            "bold",
            "100",
            "200",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900",
          ]}
          onChange={(v) => updateStyle("fontWeight", v)}
        />
        <PropertyField
          label="Line Height"
          value={styles.lineHeight || ""}
          placeholder="1.5"
          onChange={(v) => updateStyle("lineHeight", v)}
        />
        <PropertyField
          label="Text Align"
          value={styles.textAlign || ""}
          options={["left", "center", "right", "justify"]}
          onChange={(v) => updateStyle("textAlign", v)}
        />
        <PropertyField
          label="Color"
          value={styles.color || ""}
          placeholder="#000000"
          onChange={(v) => updateStyle("color", v)}
        />
      </StyleSection>

      <StyleSection title="Background">
        <ColorPicker
          label="Color"
          value={styles.backgroundColor || ""}
          onChange={(v) => updateStyle("backgroundColor", v)}
        />
        <PropertyField
          label="Image URL"
          value={styles.backgroundImage || ""}
          placeholder="url(...)"
          onChange={(v) => updateStyle("backgroundImage", v)}
        />
        <PropertyField
          label="Repeat"
          value={styles.backgroundRepeat || ""}
          options={["repeat", "no-repeat", "repeat-x", "repeat-y"]}
          onChange={(v) => updateStyle("backgroundRepeat", v)}
        />
        <PropertyField
          label="Position"
          value={styles.backgroundPosition || ""}
          options={[
            "top left",
            "top center",
            "top right",
            "center left",
            "center",
            "center right",
            "bottom left",
            "bottom center",
            "bottom right",
          ]}
          onChange={(v) => updateStyle("backgroundPosition", v)}
        />
        <PropertyField
          label="Size"
          value={styles.backgroundSize || ""}
          options={["auto", "cover", "contain"]}
          onChange={(v) => updateStyle("backgroundSize", v)}
        />
      </StyleSection>

      <StyleSection title="Border">
        <PropertyField
          label="Width"
          value={styles.borderWidth || ""}
          placeholder="1px"
          onChange={(v) => updateStyle("borderWidth", v)}
        />
        <PropertyField
          label="Style"
          value={styles.borderStyle || ""}
          options={["none", "solid", "dashed", "dotted", "double"]}
          onChange={(v) => updateStyle("borderStyle", v)}
        />
        <ColorPicker
          label="Color"
          value={styles.borderColor || ""}
          onChange={(v) => updateStyle("borderColor", v)}
        />
        <PropertyField
          label="Radius"
          value={styles.borderRadius || ""}
          placeholder="4px or 50%"
          onChange={(v) => updateStyle("borderRadius", v)}
        />
      </StyleSection>

      <StyleSection title="Effects">
        <PropertyField
          label="Box Shadow"
          value={styles.boxShadow || ""}
          placeholder="0 2px 4px rgba(0,0,0,0.1)"
          onChange={(v) => updateStyle("boxShadow", v)}
        />
        <PropertyField
          label="Opacity"
          value={styles.opacity || ""}
          placeholder="0-100"
          onChange={(v) => updateStyle("opacity", v)}
        />
        <PropertyField
          label="Transform"
          value={styles.transform || ""}
          placeholder="rotate(45deg)"
          onChange={(v) => updateStyle("transform", v)}
        />
        <PropertyField
          label="Transition"
          value={styles.transition || ""}
          placeholder="all 0.3s ease"
          onChange={(v) => updateStyle("transition", v)}
        />
      </StyleSection>

      <StyleSection title="Position">
        <PropertyField
          label="Position"
          value={styles.position || ""}
          options={["static", "relative", "absolute", "fixed", "sticky"]}
          onChange={(v) => updateStyle("position", v)}
        />
        {styles.position === "absolute" && (
          <>
            <PropertyField
              label="Top"
              value={styles.top || ""}
              placeholder="10px"
              onChange={(v) => updateStyle("top", v)}
            />
            <PropertyField
              label="Right"
              value={styles.right || ""}
              placeholder="10px"
              onChange={(v) => updateStyle("right", v)}
            />
            <PropertyField
              label="Bottom"
              value={styles.bottom || ""}
              placeholder="10px"
              onChange={(v) => updateStyle("bottom", v)}
            />
            <PropertyField
              label="Left"
              value={styles.left || ""}
              placeholder="10px"
              onChange={(v) => updateStyle("left", v)}
            />
          </>
        )}
        <PropertyField
          label="Z Index"
          value={styles.zIndex || ""}
          placeholder="1"
          onChange={(v) => updateStyle("zIndex", v)}
        />
      </StyleSection>
    </div>
  );
}

function StyleSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/50 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
      >
        {title}
        <svg
          className={cn("w-3 h-3 transition-transform", isOpen ? "rotate-180" : "")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div className="p-3 space-y-3">{children}</div>}
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-500">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || "#ffffff"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-700 cursor-pointer"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded px-2 py-1.5 text-[11px] outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
    </div>
  );
}

function LayersPanel({ editor }: { editor: any }) {
  const selectedNodePos = useEditorStore((s) => s.selectedNodePos);
  const documentVersion = useEditorStore((s) => s.documentVersion);
  const [layers, setLayers] = React.useState<any[]>([]);

  React.useEffect(() => {
    const items: any[] = [];
    const state = editor.getState();

    items.push({ name: "Page Root", pos: -1, depth: 0, id: "root-doc" });

    state.doc.descendants((node: Node, pos: number) => {
      if (node.type.name !== "text" && node.type.name !== "doc") {
        items.push({
          name: node.type.name,
          pos,
          depth: state.doc.resolve(pos).depth,
          id: `${node.type.name}-${pos}`,
        });
      }
      return true;
    });
    setLayers(items);
  }, [editor, documentVersion]);

  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-4">
        Navigator
      </h3>
      {layers.length === 0 && (
        <p className="text-[11px] text-neutral-500 italic">Canvas is currently empty.</p>
      )}
      <div className="space-y-1">
        {layers.map((layer) => (
          <div
            key={layer.id}
            onClick={() => {
              if (layer.pos === -1) {
                editor.selectionService.deselectAll();
              } else {
                editor.selectionService.selectNodeAt(layer.pos);
              }
            }}
            style={{ paddingLeft: `${layer.depth * 16}px` }}
            className={cn(
              "group flex items-center gap-2.5 py-2 px-3 rounded-md cursor-pointer transition-all border",
              layer.pos === selectedNodePos
                ? "bg-blue-500 text-white border-blue-600 shadow-md transform scale-[1.02]"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
            )}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                layer.pos === selectedNodePos ? "bg-white animate-pulse" : "bg-blue-500/40"
              )}
            />
            <span className="text-[11px] font-semibold capitalize tracking-wide">{layer.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options?: string[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-medium text-neutral-500 dark:text-neutral-500 uppercase tracking-tight">
        {label}
      </label>
      {options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
        >
          <option value="">Select...</option>
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2 text-[12px] outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      )}
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

import React from "react";
import { BlockComponentProps, BlockConfig, BlockRenderer, useBuilder, generateId } from "@arkpad/builder";
import { Columns } from "lucide-react";
import clsx from "clsx";
import {
  toGapTailwind,
  toPaddingSideTailwind,
  toPaddingTailwind,
  toMarginSideTailwind,
  toMarginTailwind,
} from "@arkpad/builder";

interface LayoutPreset {
  id: string;
  label: string;
  columns: number;
  rows: number;
}

const PRESETS: LayoutPreset[] = [
  { id: "2col", label: "2 Columns", columns: 2, rows: 1 },
  { id: "3col", label: "3 Columns", columns: 3, rows: 1 },
  { id: "2x2", label: "2x2 Grid", columns: 2, rows: 2 },
  { id: "3x2", label: "3x2 Grid", columns: 3, rows: 2 },
  { id: "2x3", label: "2x3 Grid", columns: 2, rows: 3 },
  { id: "3x3", label: "3x3 Grid", columns: 3, rows: 3 },
];

export const LayoutBlock: React.FC<BlockComponentProps> = ({
  id,
  props,
  styles = {},
  children,
}) => {
  const { addBlock, updateBlock } = useBuilder();
  const columns = Math.max(1, Math.trunc(Number(props.columns) || 1));
  
  const childIds = (children || []) as string[];
  const hasChildren = childIds.length > 0;

  const gap = toGapTailwind(styles.gap || "1rem");
  const paddingTop = toPaddingSideTailwind(styles.paddingTop, "top");
  const paddingRight = toPaddingSideTailwind(styles.paddingRight, "right");
  const paddingBottom = toPaddingSideTailwind(styles.paddingBottom, "bottom");
  const paddingLeft = toPaddingSideTailwind(styles.paddingLeft, "left");
  const hasPaddingSides = Boolean(
    paddingTop.className || paddingTop.style ||
    paddingRight.className || paddingRight.style ||
    paddingBottom.className || paddingBottom.style ||
    paddingLeft.className || paddingLeft.style
  );
  const padding = hasPaddingSides
    ? { className: null, style: null }
    : toPaddingTailwind(styles.padding);

  const marginTop = toMarginSideTailwind(styles.marginTop, "top");
  const marginRight = toMarginSideTailwind(styles.marginRight, "right");
  const marginBottom = toMarginSideTailwind(styles.marginBottom, "bottom");
  const marginLeft = toMarginSideTailwind(styles.marginLeft, "left");
  const hasMarginSides = Boolean(
    marginTop.className || marginTop.style ||
    marginRight.className || marginRight.style ||
    marginBottom.className || marginBottom.style ||
    marginLeft.className || marginLeft.style
  );
  const margin = hasMarginSides
    ? { className: null, style: null }
    : toMarginTailwind(styles.margin);

  const hasHorizontalMargin =
    typeof styles.margin === "string" ||
    typeof styles.marginLeft === "string" ||
    typeof styles.marginRight === "string";

  const baseWidthClass = hasHorizontalMargin ? "w-auto" : "w-full";

  const handleSelectPreset = (preset: LayoutPreset) => {
    const count = preset.columns * preset.rows;
    const generatedIds: string[] = [];

    // Create cells
    for (let i = 0; i < count; i++) {
      const cellId = `container-${generateId()}`;
      generatedIds.push(cellId);

      const cellBlock = {
        id: cellId,
        type: "container",
        enabled: true,
        parentId: id,
        children: [],
        props: {
          layout: "flex",
          isLayoutCell: true,
          htmlTag: "div",
        },
        styles: {
          className: "min-h-[80px] p-2",
        },
      };

      addBlock(cellBlock, id);
    }

    // Link generated cells to this Layout block
    updateBlock(id, {
      props: {
        ...props,
        columns: preset.columns,
        rows: preset.rows,
      },
      children: generatedIds,
    });
  };

  if (!hasChildren) {
    return (
      <div className="w-full p-6 border border-neutral-300 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 flex flex-col items-center justify-center gap-4 font-mono select-none">
        <div className="text-center space-y-1">
          <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
            Select Layout Preset
          </h4>
          <p className="text-[10px] text-neutral-450 dark:text-neutral-500">
            Choose a grid structure to initialize cell slots
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="p-3 border border-neutral-300 dark:border-neutral-800 hover:border-neutral-900 dark:hover:border-neutral-100 bg-white dark:bg-neutral-950 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-2.5 rounded-none transition-all duration-150 focus:outline-none"
            >
              <div className="grid gap-0.5 w-10 h-6" style={{ gridTemplateColumns: `repeat(${preset.columns}, 1fr)` }}>
                {Array.from({ length: preset.columns * preset.rows }).map((_, i) => (
                  <div key={i} className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-750" />
                ))}
              </div>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "grid max-w-full min-w-0 transition-all duration-150",
        baseWidthClass,
        gap.className,
        padding.className,
        margin.className,
        paddingTop.className,
        paddingRight.className,
        paddingBottom.className,
        paddingLeft.className,
        marginTop.className,
        marginRight.className,
        marginBottom.className,
        marginLeft.className
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        ...gap.style,
        ...padding.style,
        ...margin.style,
        ...paddingTop.style,
        ...paddingRight.style,
        ...paddingBottom.style,
        ...paddingLeft.style,
        ...marginTop.style,
        ...marginRight.style,
        ...marginBottom.style,
        ...marginLeft.style,
      }}
    >
      {childIds.map((childId, index) => (
        <div key={childId} className="min-h-[50px] min-w-0">
          <BlockRenderer blockId={childId} index={index} parentId={id} />
        </div>
      ))}
    </div>
  );
};

export const LayoutBlockConfig: BlockConfig = {
  type: "layout",
  name: "Grid Layout",
  description: "Pre-structured multi-column grid layouts.",
  icon: Columns,
  component: LayoutBlock,
  defaultProps: {
    columns: 2,
    rows: 1,
  },
  defaultStyles: {
    gap: "1rem",
  },
  editorFields: [
    {
      name: "columns",
      label: "Columns",
      type: "number",
      defaultValue: 2,
    },
  ],
};

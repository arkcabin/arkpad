import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { Layout } from "lucide-react";
import clsx from "clsx";
import {
  BlockComponentProps,
  BlockConfig,
  BlockRenderer,
  toFlexDirectionClass,
  toGapTailwind,
  toJustifyClass,
  toAlignItemsClass,
  toHeightTailwind,
  toGridColsClass,
  toMaxHeightTailwind,
  toMaxWidthTailwind,
  toMinHeightTailwind,
  toMinWidthTailwind,
  toPaddingTailwind,
  toMarginTailwind,
  toPaddingSideTailwind,
  toMarginSideTailwind,
  toWidthTailwind,
} from "@arkpad/builder";
export const ContainerBlock: React.FC<BlockComponentProps> = ({
  id,
  props = {},
  styles = {},
  children,
  isEditing,
}) => {
  const isLayoutCell = Boolean(props.isLayoutCell);
  const isGrid = props.layout === "grid";
  const isRoot = id === "root-container" || id === "root-canvas" || Boolean(props.isRoot);
  const Tag = (props.htmlTag as React.ElementType) || "div";

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "container",
    },
  });

  // Calculate style object and classnames using our Tailwind utility maps
  const gridColsClass = isGrid ? toGridColsClass(props.columns) : null;
  const gap = toGapTailwind(styles.gap);
  
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
  const shouldIgnoreFullWidth = isRoot && hasHorizontalMargin && styles.width === "100%";
  const width = shouldIgnoreFullWidth
    ? { className: null, style: null }
    : toWidthTailwind(styles.width);
  const minWidth = toMinWidthTailwind(styles.minWidth);
  const maxWidth = toMaxWidthTailwind(styles.maxWidth);
  const height = toHeightTailwind(styles.height);
  const minHeight = toMinHeightTailwind(styles.minHeight);
  const maxHeight = toMaxHeightTailwind(styles.maxHeight);
  const hasFixedSize = Boolean(styles.height || styles.maxHeight);
  const flexDirClass = toFlexDirectionClass(styles.flexDirection, isGrid);
  const justifyClass = toJustifyClass(styles.justifyContent, isGrid);
  const alignItemsClass = toAlignItemsClass(styles.alignItems);

  const baseWidthClass = shouldIgnoreFullWidth
    ? "w-auto"
    : styles.width || styles.minWidth || styles.maxWidth
      ? null
      : isRoot && (styles.margin || styles.marginLeft || styles.marginRight)
        ? "w-auto"
        : "w-full";

  const childIds = (children || []) as string[];
  const hasChildren = childIds.length > 0;

  const content = (
    <>
      {childIds.map((childId, index) => {
        // Render child block using BlockRenderer
        return (
          <div key={childId} className="max-w-full min-w-0">
            <BlockRenderer blockId={childId} index={index} parentId={id} />
          </div>
        );
      })}

      {/* Empty State visual */}
      {!hasChildren && !isRoot && !isLayoutCell && (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-neutral-300 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-500 text-xs font-mono py-10 w-full">
          <Layout className="w-5 h-5 mb-2 opacity-55" />
          <span>Empty Container</span>
          {isEditing && (
            <span className="text-[10px] text-neutral-450 dark:text-neutral-600 mt-1">
              Drag elements here
            </span>
          )}
        </div>
      )}
    </>
  );

  const mergedStyles = {
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
    ...width.style,
    ...minWidth.style,
    ...maxWidth.style,
    ...height.style,
    ...minHeight.style,
    ...maxHeight.style,
  };

  const mergedClasses = clsx(
    baseWidthClass,
    isLayoutCell ? "min-h-[60px]" : "min-h-[100px]",
    isRoot && "p-6",
    styles.className,
    isGrid ? "grid" : "flex",
    gridColsClass,
    flexDirClass,
    justifyClass,
    alignItemsClass,
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
    marginLeft.className,
    width.className,
    minWidth.className,
    maxWidth.className,
    height.className,
    minHeight.className,
    maxHeight.className,
    hasFixedSize && "overflow-auto",
    isEditing && isOver && "bg-neutral-100/50 dark:bg-neutral-900/30 border border-dashed border-neutral-400 dark:border-neutral-700"
  );

  if (isEditing) {
    return (
      <Tag
        ref={setNodeRef}
        style={mergedStyles}
        className={mergedClasses}
      >
        {content}
      </Tag>
    );
  }

  return (
    <Tag
      style={mergedStyles}
      className={mergedClasses}
    >
      {content}
    </Tag>
  );
};

export const ContainerBlockConfig: BlockConfig = {
  type: "container",
  name: "Container",
  description: "Flexible flexbox/grid layout container with customizable slots.",
  icon: Layout,
  component: ContainerBlock,
  defaultProps: {
    layout: "flex",
    htmlTag: "div",
  },
  defaultStyles: {
    className: "w-full min-h-[100px] p-4 flex flex-col gap-4 border border-neutral-200 dark:border-neutral-800",
  },
  editorFields: [
    {
      name: "layout",
      label: "Layout Model",
      type: "select",
      options: [
        { label: "Flex Box", value: "flex" },
        { label: "Grid Layout", value: "grid" },
      ],
      defaultValue: "flex",
    },
    {
      name: "columns",
      label: "Grid Columns (1-12)",
      type: "number",
      defaultValue: 1,
    },
    {
      name: "htmlTag",
      label: "HTML Tag wrapper",
      type: "select",
      options: [
        { label: "div", value: "div" },
        { label: "section", value: "section" },
        { label: "article", value: "article" },
        { label: "aside", value: "aside" },
        { label: "header", value: "header" },
        { label: "footer", value: "footer" },
      ],
      defaultValue: "div",
    },
  ],
};

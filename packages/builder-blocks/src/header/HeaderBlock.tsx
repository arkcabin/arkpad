import React from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { Heading } from "lucide-react";
import clsx from "clsx";

export const HeaderBlock: React.FC<BlockComponentProps> = ({
  id: _id,
  props = {},
  styles = {},
}) => {
  const {
    text = "Section Title",
    level = 1,
    align = "left",
    monospace = true,
    uppercase = true,
    borderBottom = false,
  } = props;

  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

  const sizeClasses = {
    1: "text-lg font-bold tracking-widest",
    2: "text-base font-semibold tracking-wider",
    3: "text-sm font-semibold tracking-wide",
    4: "text-xs font-medium tracking-normal",
    5: "text-[11px] font-medium tracking-normal",
    6: "text-[10px] font-normal tracking-tight",
  }[level as 1 | 2 | 3 | 4 | 5 | 6] || "text-lg font-bold tracking-widest";

  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[align as "left" | "center" | "right"] || "text-left";

  return (
    <div
      className={clsx(
        "w-full flex flex-col transition-all duration-150",
        borderBottom && "border-b border-neutral-300 dark:border-neutral-855 pb-2.5 mb-2.5",
        styles.className
      )}
      style={{
        width: styles.width,
        height: styles.height,
        marginTop: styles.marginTop,
        marginRight: styles.marginRight,
        marginBottom: styles.marginBottom,
        marginLeft: styles.marginLeft,
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
      }}
    >
      <Tag
        className={clsx(
          "text-neutral-900 dark:text-neutral-100 transition-colors",
          sizeClasses,
          alignClasses,
          monospace ? "font-mono" : "font-sans",
          uppercase ? "uppercase" : "normal-case"
        )}
      >
        {text}
      </Tag>
    </div>
  );
};

export const HeaderBlockConfig: BlockConfig = {
  type: "header",
  name: "HUD Header Label",
  description: "Standard section titles and telemetry-label headers.",
  icon: Heading,
  component: HeaderBlock,
  defaultProps: {
    text: "Section Header",
    level: 1,
    align: "left",
    monospace: true,
    uppercase: true,
    borderBottom: false,
  },
  defaultStyles: {
    width: "100%",
  },
  editorFields: [
    {
      name: "text",
      label: "Title Text",
      type: "text",
      defaultValue: "Section Header",
    },
    {
      name: "level",
      label: "Heading Level (H1-H6)",
      type: "select",
      options: [
        { label: "Level 1 (Large)", value: 1 },
        { label: "Level 2 (Medium)", value: 2 },
        { label: "Level 3 (Small)", value: 3 },
        { label: "Level 4 (Mini)", value: 4 },
        { label: "Level 5", value: 5 },
        { label: "Level 6", value: 6 },
      ],
      defaultValue: 1,
    },
    {
      name: "align",
      label: "Text Alignment",
      type: "select",
      options: [
        { label: "Left Aligned", value: "left" },
        { label: "Centered", value: "center" },
        { label: "Right Aligned", value: "right" },
      ],
      defaultValue: "left",
    },
    {
      name: "monospace",
      label: "Monospace Telemetry Font",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "uppercase",
      label: "Transform to Uppercase",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "borderBottom",
      label: "Display Bottom HUD Border Line",
      type: "checkbox",
      defaultValue: false,
    },
  ],
};

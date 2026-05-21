import React from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { TrendingUp, TrendingDown, Minus, Hash } from "lucide-react";
import clsx from "clsx";

export const MetricBlock: React.FC<BlockComponentProps> = ({
  id: _id,
  props,
  styles: _styles,
  interactions: _interactions,
  isEditing: _isEditing,
  updateBlock: _updateBlock,
}) => {
  const title = props.title || "Monthly Sales";
  const value = props.value || "$0.00";
  const change = props.change || "0%";
  const trend = props.trend || "neutral";
  const suffix = props.suffix || "";

  return (
    <div className="flex flex-col gap-1 text-left select-none">
      {/* Title */}
      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
        {title}
      </span>

      {/* Value */}
      <div className="flex items-baseline gap-1.5 mt-0.5">
        <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {value}
        </span>
        {suffix && (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
            {suffix}
          </span>
        )}
      </div>

      {/* Change / Trend Badge */}
      <div className="flex items-center gap-1.5 mt-1">
        <div
          className={clsx(
            "flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-none",
            trend === "up" && "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30",
            trend === "down" && "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30",
            trend === "neutral" && "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800"
          )}
        >
          {trend === "up" && <TrendingUp className="w-2.5 h-2.5" />}
          {trend === "down" && <TrendingDown className="w-2.5 h-2.5" />}
          {trend === "neutral" && <Minus className="w-2.5 h-2.5" />}
          <span>{change}</span>
        </div>
        <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-medium">vs last month</span>
      </div>
    </div>
  );
};

export const MetricBlockConfig: BlockConfig = {
  type: "metric-card",
  name: "Metric Card",
  description: "Display numerical KPIs, growth trends, and statistics.",
  icon: Hash,
  component: MetricBlock,
  defaultProps: {
    title: "Active Users",
    value: "14,892",
    change: "+8.3%",
    trend: "up",
    suffix: "/ month"
  },
  editorFields: [
    {
      name: "title",
      label: "Metric Title",
      type: "text",
      placeholder: "e.g., Active Users",
      defaultValue: "Active Users"
    },
    {
      name: "value",
      label: "KPI Value",
      type: "text",
      placeholder: "e.g., 14,892",
      defaultValue: "14,892"
    },
    {
      name: "suffix",
      label: "Value Suffix",
      type: "text",
      placeholder: "e.g., / month or USD",
      defaultValue: ""
    },
    {
      name: "change",
      label: "Trend Percentage",
      type: "text",
      placeholder: "e.g., +8.3% or -2.4%",
      defaultValue: "+8.3%"
    },
    {
      name: "trend",
      label: "Trend Direction",
      type: "select",
      defaultValue: "up",
      options: [
        { label: "Growth (Up)", value: "up" },
        { label: "Decline (Down)", value: "down" },
        { label: "Stable (Neutral)", value: "neutral" }
      ]
    }
  ]
};

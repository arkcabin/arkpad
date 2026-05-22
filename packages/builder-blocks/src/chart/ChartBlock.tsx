import React from "react";
import { BlockComponentProps, BlockConfig } from "@arkpad/builder";
import { BarChart3 } from "lucide-react";

export const ChartBlock: React.FC<BlockComponentProps> = ({
  props,
}) => {
  const title = props.title || "Weekly Analytics";
  const type = props.chartType || "bar";
  const themeColor = !props.color || props.color === "#ffffff" ? "#10b981" : props.color;
  const rawData = props.dataset || "35,62,45,80,50,95";

  // Parse comma-separated dataset
  const dataPoints = rawData
    .split(",")
    .map((val: string) => Number(val.trim()))
    .filter((num: number) => !isNaN(num));

  // Fallback data if empty
  const points = dataPoints.length > 0 ? dataPoints : [30, 45, 35, 60, 40, 75];

  const svgHeight = 120;
  const svgWidth = 400;
  const padding = 15;
  const maxVal = Math.max(...points, 100);

  // Map data to SVG grid points
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : chartWidth;

  const svgPoints = points.map((val: number, idx: number) => {
    const x = padding + idx * stepX;
    // Invert Y axis for SVG (0 is top)
    const y = svgHeight - padding - (val / maxVal) * chartHeight;
    return { x, y, value: val };
  });

  // Construct lines or curves
  const linePath = svgPoints.reduce((acc: string, pt: { x: number; y: number; value: number }, idx: number) => {
    return acc + `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = svgPoints.length > 0
    ? `${linePath} L ${svgPoints[svgPoints.length - 1].x} ${svgHeight - padding} L ${svgPoints[0].x} ${svgHeight - padding} Z`
    : "";

  return (
    <div className="flex flex-col gap-3 text-left w-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
          {title}
        </span>
        <span className="text-[9px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 px-1.5 py-0.5 rounded-none">
          {type}
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="relative border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950/20 p-2.5">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Grid lines (horizontal divisions) */}
          <line
            x1={padding}
            y1={padding}
            x2={svgWidth - padding}
            y2={padding}
            stroke="currentColor"
            className="text-neutral-200 dark:text-neutral-900"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={padding}
            y1={svgHeight / 2}
            x2={svgWidth - padding}
            y2={svgHeight / 2}
            stroke="currentColor"
            className="text-neutral-200 dark:text-neutral-900"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <line
            x1={padding}
            y1={svgHeight - padding}
            x2={svgWidth - padding}
            y2={svgHeight - padding}
            stroke="currentColor"
            className="text-neutral-300 dark:text-neutral-850"
            strokeWidth="1"
          />

          {/* Area Fill */}
          {type === "area" && areaPath && (
            <>
              <defs>
                <linearGradient id={`areaGrad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={themeColor} stopOpacity="0.25" />
                  <stop offset="100%" stopColor={themeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill={`url(#areaGrad-${title})`} />
            </>
          )}

          {/* Line or Area Draw */}
          {(type === "line" || type === "area") && linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={themeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Bar Chart Bars */}
          {type === "bar" && (
            <>
              {svgPoints.map((pt: { x: number; y: number; value: number }, idx: number) => {
                const barWidth = Math.max(12, chartWidth / points.length - 8);
                const rectHeight = svgHeight - padding - pt.y;
                const rectX = pt.x - barWidth / 2;

                return (
                  <rect
                    key={idx}
                    x={rectX}
                    y={pt.y}
                    width={barWidth}
                    height={rectHeight}
                    fill={themeColor}
                    opacity="0.85"
                    className="hover:opacity-100 transition-opacity"
                    rx="1"
                  />
                );
              })}
            </>
          )}

          {/* Dot Markers for Line/Area points */}
          {(type === "line" || type === "area") &&
            svgPoints.map((pt: { x: number; y: number; value: number }, idx: number) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="currentColor"
                className="text-white dark:text-neutral-950"
                stroke={themeColor}
                strokeWidth="1.5"
              />
            ))}
        </svg>
      </div>

      {/* Footer labels */}
      <div className="flex justify-between text-[9px] text-neutral-450 dark:text-neutral-600 font-semibold px-2">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>
    </div>
  );
};

export const ChartBlockConfig: BlockConfig = {
  type: "chart",
  name: "Analytics Chart",
  description: "Dynamic visual representation of statistical data logs.",
  icon: BarChart3,
  component: ChartBlock,
  defaultProps: {
    title: "Weekly Analytics",
    chartType: "bar",
    color: "#10b981",
    dataset: "35,62,45,80,50,95"
  },
  editorFields: [
    {
      name: "title",
      label: "Chart Title",
      type: "text",
      placeholder: "e.g., Active Sales",
      defaultValue: "Weekly Analytics"
    },
    {
      name: "chartType",
      label: "Chart Visual Type",
      type: "select",
      defaultValue: "bar",
      options: [
        { label: "Bar Chart", value: "bar" },
        { label: "Line Chart", value: "line" },
        { label: "Area Grid Chart", value: "area" }
      ]
    },
    {
      name: "color",
      label: "Accent Hex Color",
      type: "color",
      placeholder: "#ffffff",
      defaultValue: "#ffffff"
    },
    {
      name: "dataset",
      label: "Dataset (Comma Separated Numbers)",
      type: "text",
      placeholder: "e.g., 35,62,45,80,50,95",
      defaultValue: "35,62,45,80,50,95",
      description: "Enter 6 numbers separated by commas for each day of the week."
    }
  ]
};

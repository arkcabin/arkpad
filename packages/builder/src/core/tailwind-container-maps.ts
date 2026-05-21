import type { CSSProperties } from "react";

export const GRID_COLS_CLASS = [
  "grid-cols-1",
  "grid-cols-2",
  "grid-cols-3",
  "grid-cols-4",
  "grid-cols-5",
  "grid-cols-6",
  "grid-cols-7",
  "grid-cols-8",
  "grid-cols-9",
  "grid-cols-10",
  "grid-cols-11",
  "grid-cols-12",
] as const;

export const GAP_CLASS: Record<string, string> = {
  "0": "gap-0",
  "1": "gap-1",
  "2": "gap-2",
  "3": "gap-3",
  "4": "gap-4",
  "5": "gap-5",
  "6": "gap-6",
  "7": "gap-7",
  "8": "gap-8",
  "9": "gap-9",
  "10": "gap-10",
  "11": "gap-11",
  "12": "gap-12",
};

export const PADDING_CLASS: Record<string, string> = {
  "0": "p-0",
  "1": "p-1",
  "2": "p-2",
  "3": "p-3",
  "4": "p-4",
  "5": "p-5",
  "6": "p-6",
  "7": "p-7",
  "8": "p-8",
  "9": "p-9",
  "10": "p-10",
  "11": "p-11",
  "12": "p-12",
};

export const MARGIN_CLASS: Record<string, string> = {
  "0": "m-0",
  "1": "m-1",
  "2": "m-2",
  "3": "m-3",
  "4": "m-4",
  "5": "m-5",
  "6": "m-6",
  "7": "m-7",
  "8": "m-8",
  "9": "m-9",
  "10": "m-10",
  "11": "m-11",
  "12": "m-12",
};

const JUSTIFY_FLEX_CLASS: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

const JUSTIFY_GRID_ITEMS_CLASS: Record<string, string> = {
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
};

const ALIGN_ITEMS_CLASS: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
};

const ALIGN_SELF_CLASS: Record<string, string> = {
  start: "self-start",
  center: "self-center",
  end: "self-end",
  stretch: "self-stretch",
  auto: "self-auto",
};

function toClampedInt(value: unknown, fallback: number, min: number, max: number) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.min(max, Math.max(min, Math.trunc(value)));
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.min(max, Math.max(min, parsed));
    }
  }
  return fallback;
}

function toNumericKey(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string") return value.trim();
  return null;
}

const CSS_LENGTH_RE = /^-?\d+(?:\.\d+)?(px|rem|%|vw|vh|svh|dvh|lvh)$/;

function toCssLength(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed === "0") return "0px";
  if (!CSS_LENGTH_RE.test(trimmed)) return null;
  return trimmed;
}

function toViewportMinHeightClass(value: unknown) {
  if (value === "100vh") return "min-h-screen";
  if (value === "100svh") return "min-h-svh";
  if (value === "100dvh") return "min-h-dvh";
  if (value === "100lvh") return "min-h-lvh";
  return null;
}

function toViewportHeightClass(value: unknown) {
  if (value === "100vh") return "h-screen";
  if (value === "100svh") return "h-svh";
  if (value === "100dvh") return "h-dvh";
  if (value === "100lvh") return "h-lvh";
  return null;
}

export function toGridColsClass(columns: unknown) {
  const cols = toClampedInt(columns, 1, 1, 12);
  return GRID_COLS_CLASS[cols - 1] ?? GRID_COLS_CLASS[0];
}

export function toGridColSpanClass(width: unknown, columns: unknown) {
  const cols = toClampedInt(columns, 1, 1, 12);
  if (width === "100%") return "col-span-full";
  if (width === "auto" || width === null || width === undefined) return null;
  if (typeof width === "string") {
    const m = width.trim().match(/^(-?\d+(?:\.\d+)?)%$/);
    if (m) {
      const rawMatch = m[1];
      if (rawMatch !== undefined) {
        const percent = Number.parseFloat(rawMatch);
        if (Number.isFinite(percent)) {
          const span = Math.max(1, Math.min(cols, Math.round((percent / 100) * cols)));
          if (span >= cols) return "col-span-full";
          return `col-span-${span}`;
        }
      }
    }
  }
  return null;
}

export function toGapClass(value: unknown) {
  const key = toNumericKey(value);
  return key ? (GAP_CLASS[key] ?? null) : null;
}

export function toPaddingClass(value: unknown) {
  const key = toNumericKey(value);
  return key ? (PADDING_CLASS[key] ?? null) : null;
}

export function toMarginClass(value: unknown) {
  const key = toNumericKey(value);
  return key ? (MARGIN_CLASS[key] ?? null) : null;
}

export interface TailwindResult {
  className: string | null;
  cssVar: string | null;
  style?: CSSProperties | null;
}

export function toGapTailwind(value: unknown): TailwindResult {
  const scale = toGapClass(value);
  if (scale) return { className: scale, cssVar: null, style: null };
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { gap: cssLength } };
}

export function toPaddingTailwind(value: unknown): TailwindResult {
  const scale = toPaddingClass(value);
  if (scale) return { className: scale, cssVar: null, style: null };
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { padding: cssLength } };
}

export function toMarginTailwind(value: unknown): TailwindResult {
  const scale = toMarginClass(value);
  if (scale) return { className: scale, cssVar: null, style: null };
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { margin: cssLength } };
}

export function toPaddingSideTailwind(
  value: unknown,
  side: "top" | "right" | "bottom" | "left"
): TailwindResult {
  const scale = toPaddingClass(value);
  if (scale) {
    const prefix = { top: "pt-", right: "pr-", bottom: "pb-", left: "pl-" }[side];
    return { className: scale.replace("p-", prefix), cssVar: null, style: null };
  }

  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };

  const prop = {
    top: "paddingTop",
    right: "paddingRight",
    bottom: "paddingBottom",
    left: "paddingLeft",
  }[side];

  return { className: null, cssVar: null, style: { [prop]: cssLength } };
}

export function toMarginSideTailwind(
  value: unknown,
  side: "top" | "right" | "bottom" | "left"
): TailwindResult {
  const scale = toMarginClass(value);
  if (scale) {
    const prefix = { top: "mt-", right: "mr-", bottom: "mb-", left: "ml-" }[side];
    return { className: scale.replace("m-", prefix), cssVar: null, style: null };
  }

  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };

  const prop = {
    top: "marginTop",
    right: "marginRight",
    bottom: "marginBottom",
    left: "marginLeft",
  }[side];

  return { className: null, cssVar: null, style: { [prop]: cssLength } };
}

export function toWidthTailwind(value: unknown): TailwindResult {
  if (value === "100%") return { className: "w-full", cssVar: null, style: null };
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { width: cssLength } };
}

export function toHeightTailwind(value: unknown): TailwindResult {
  const viewport = toViewportHeightClass(value);
  if (viewport) return { className: viewport, cssVar: null, style: null };
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { height: cssLength } };
}

export function toMinHeightTailwind(value: unknown): TailwindResult {
  const viewport = toViewportMinHeightClass(value);
  if (viewport) return { className: viewport, cssVar: null, style: null };
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { minHeight: cssLength } };
}

export function toMaxHeightTailwind(value: unknown): TailwindResult {
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { maxHeight: cssLength } };
}

export function toMinWidthTailwind(value: unknown): TailwindResult {
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { minWidth: cssLength } };
}

export function toMaxWidthTailwind(value: unknown): TailwindResult {
  const cssLength = toCssLength(value);
  if (!cssLength) return { className: null, cssVar: null, style: null };
  return { className: null, cssVar: null, style: { maxWidth: cssLength } };
}

export function toFlexDirectionClass(value: unknown, isGrid: boolean) {
  if (isGrid) return null;
  return value === "row" ? "flex-row" : "flex-col";
}

export function toJustifyClass(value: unknown, isGrid: boolean) {
  if (typeof value !== "string") return null;
  const key = value.trim();
  if (!key) return null;
  return isGrid ? (JUSTIFY_GRID_ITEMS_CLASS[key] ?? null) : (JUSTIFY_FLEX_CLASS[key] ?? null);
}

export function toAlignItemsClass(value: unknown) {
  if (typeof value !== "string") return null;
  const key = value.trim();
  if (!key) return null;
  return ALIGN_ITEMS_CLASS[key] ?? null;
}

export function toAlignSelfClass(value: unknown) {
  if (typeof value !== "string") return null;
  const key = value.trim();
  if (!key) return null;
  return ALIGN_SELF_CLASS[key] ?? null;
}

export function toMinHeightClass(value: unknown) {
  return value === "100vh" ? "min-h-screen" : null;
}

export function toWidthClass(value: unknown) {
  return value === "100%" ? "w-full" : null;
}

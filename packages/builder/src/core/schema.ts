import { z } from "zod";
import { LayoutJSON } from "./types";

/**
 * Zod schema to validate individual block data structures (Puck-style schema contract).
 */
export const BlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  properties: z.record(z.string(), z.any())
});

/**
 * Zod schema to validate layout column grids.
 */
export const ColumnSchema = z.object({
  id: z.string(),
  width: z.number().int().min(1).max(12),
  blocks: z.array(BlockSchema)
});

/**
 * Zod schema to validate layout rows.
 */
export const RowSchema = z.object({
  id: z.string(),
  columns: z.array(ColumnSchema)
});

/**
 * Root Zod schema to validate the entire builder JSON state configuration tree.
 */
export const LayoutSchema = z.object({
  rows: z.array(RowSchema)
});

/**
 * Parses and validates an unknown JSON layout configuration object.
 * Returns a type-safe LayoutJSON or throws a detailed validation error.
 */
export const validateLayout = (data: unknown): LayoutJSON => {
  return LayoutSchema.parse(data);
};

/**
 * Safely parses layout configurations, returning a fallback empty layout if validation fails.
 */
export const safeValidateLayout = (data: unknown): LayoutJSON => {
  const result = LayoutSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn("Arkpad Builder Schema validation failed, reverting to empty grid:", result.error);
  return { rows: [] };
};

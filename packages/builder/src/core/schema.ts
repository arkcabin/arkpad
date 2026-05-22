import { z } from "zod";
import { PageBlock, NormalizedPageConfig } from "./types";

/**
 * Zod schema to validate Block Styles.
 */
export const BlockStylesSchema = z.record(z.string(), z.any());

/**
 * Zod schema to validate Block Interactions.
 */
export const BlockInteractionSchema = z.object({
  id: z.string(),
  trigger: z.string(),
  action: z.string(),
  settings: z.record(z.string(), z.any()),
});

/**
 * Zod schema to validate individual block data structures in the normalized graph.
 */
export const PageBlockSchema: z.ZodType<PageBlock> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    enabled: z.boolean(),
    parentId: z.string().optional(),
    children: z.union([z.array(z.string()), z.array(PageBlockSchema)]).optional(),
    props: z.record(z.string(), z.any()).optional(),
    styles: BlockStylesSchema.optional(),
    data: z.record(z.string(), z.any()).optional(),
    interactions: z.array(BlockInteractionSchema).optional(),
  })
);

/**
 * Zod schema to validate the entire normalized page configuration.
 */
export const NormalizedPageConfigSchema = z.object({
  blocks: z.record(z.string(), PageBlockSchema),
  rootIds: z.array(z.string()),
  propertyProfiles: z.record(z.string(), z.any()).optional(),
});

/**
 * Zod schema to validate a nested page layout config.
 */
export const PageConfigSchema = z.object({
  blocks: z.array(PageBlockSchema),
  propertyProfiles: z.record(z.string(), z.any()).optional(),
});

/**
 * Parses and validates an unknown normalized page configuration object.
 */
export const validatePageConfig = (data: unknown): NormalizedPageConfig => {
  return NormalizedPageConfigSchema.parse(data);
};

/**
 * Safely parses normalized page configurations, returning a fallback empty configuration if validation fails.
 */
export const safeValidatePageConfig = (data: unknown): NormalizedPageConfig => {
  const result = NormalizedPageConfigSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn("Arkpad Builder Schema validation failed, reverting to empty page config:", result.error);
  return { blocks: {}, rootIds: [] };
};

/**
 * Parses and validates a nested layout config.
 */
export const validateLayout = (data: unknown) => {
  return PageConfigSchema.parse(data);
};

/**
 * Safely parses a nested layout config, returning an empty layout when validation fails.
 */
export const safeValidateLayout = (data: unknown) => {
  const result = PageConfigSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.warn("Arkpad Builder layout validation failed, reverting to empty layout:", result.error);
  return { blocks: [] };
};


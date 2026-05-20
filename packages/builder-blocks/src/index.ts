import { blockRegistry } from "@arkpad/builder";
import { TextBlockConfig } from "./text/TextBlock";
import { MetricBlockConfig } from "./metric/MetricBlock";
import { ChartBlockConfig } from "./chart/ChartBlock";

export * from "./text/TextBlock";
export * from "./metric/MetricBlock";
export * from "./chart/ChartBlock";

export const defaultBlocks = [
  TextBlockConfig,
  MetricBlockConfig,
  ChartBlockConfig
];

/**
 * Helper utility to register all default blocks with the builder engine block registry.
 */
export const registerDefaultBlocks = () => {
  defaultBlocks.forEach((block) => {
    blockRegistry.register(block);
  });
};

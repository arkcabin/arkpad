import { blockRegistry } from "@arkpad/builder";
import { TextBlockConfig } from "./text/TextBlock";
import { MetricBlockConfig } from "./metric/MetricBlock";
import { ChartBlockConfig } from "./chart/ChartBlock";
import { ContainerBlockConfig } from "./container/ContainerBlock";
import { LayoutBlockConfig } from "./layout/LayoutBlock";
import { FormBlockConfig } from "./form/FormBlock";
import { FormFieldBlockConfig } from "./form-field/FormFieldBlock";
import { ButtonBlockConfig } from "./button/ButtonBlock";
import { TableBlockConfig } from "./table/TableBlock";
import { MediaBlockConfig } from "./media/MediaBlock";
import { HeaderBlockConfig } from "./header/HeaderBlock";
import { ContentBlockConfig } from "./content/ContentBlock";
import { TextEditorBlockConfig } from "./text-editor/TextEditorBlock";

export * from "./text/TextBlock";
export * from "./metric/MetricBlock";
export * from "./chart/ChartBlock";
export * from "./container/ContainerBlock";
export * from "./layout/LayoutBlock";
export * from "./form/FormBlock";
export * from "./form-field/FormFieldBlock";
export * from "./button/ButtonBlock";
export * from "./table/TableBlock";
export * from "./media/MediaBlock";
export * from "./header/HeaderBlock";
export * from "./content/ContentBlock";
export * from "./text-editor/TextEditorBlock";

export const defaultBlocks = [
  TextBlockConfig,
  MetricBlockConfig,
  ChartBlockConfig,
  ContainerBlockConfig,
  LayoutBlockConfig,
  FormBlockConfig,
  FormFieldBlockConfig,
  ButtonBlockConfig,
  TableBlockConfig,
  MediaBlockConfig,
  HeaderBlockConfig,
  ContentBlockConfig,
  TextEditorBlockConfig,
];

/**
 * Helper utility to register all default blocks with the builder engine block registry.
 */
export const registerDefaultBlocks = () => {
  defaultBlocks.forEach((block) => {
    blockRegistry.register(block);
  });
};

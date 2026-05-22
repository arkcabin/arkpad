import React from "react";

export type BlockProperties = Record<string, any>;

export const BLOCK_TYPES = [
  "container",
  "layout",
  "column",
  "header",
  "text",
  "image",
  "button",
  "table",
  "form",
  "form-field",
  "media",
  "content",
  "text-editor",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number] | string;

export interface BlockStyles {
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  backgroundColor?: string;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  gap?: string;
  justifyContent?: "start" | "center" | "end" | "between";
  alignItems?: "start" | "center" | "end" | "stretch";
  alignSelf?: "start" | "center" | "end" | "stretch" | "auto";
  flexDirection?: "row" | "column";
  className?: string;
  [key: string]: unknown;
}

export interface BlockInteraction {
  id: string;
  trigger: "click" | "double_click" | "row_click" | string;
  action: "navigate" | "open_drawer" | "open_modal" | "alert" | string;
  settings: {
    url?: string;
    target?: "_self" | "_blank" | string;
    targetPageId?: string;
    targetPagePath?: string;
    targetType?: "page" | "forms" | string;
    title?: string;
    size?: string;
    placement?: "right" | "left" | "top" | "bottom" | string;
    drawerWidth?: string;
    description?: string;
  };
}

export interface PageBlock {
  id: string;
  type: BlockType;
  enabled: boolean;
  parentId?: string;
  children?: PageBlock[] | string[];
  props?: Record<string, any>;
  styles?: BlockStyles;
  data?: Record<string, any>;
  interactions?: BlockInteraction[];
}

export interface PageConfig {
  blocks: PageBlock[];
  propertyProfiles?: Record<string, any>;
}

export interface NormalizedPageConfig {
  blocks: Record<string, PageBlock>;
  rootIds: string[];
  propertyProfiles?: Record<string, any>;
}

export type EditorFieldType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "textarea"
  | "color"
  | "styles"
  | "interactions";

export interface EditorFieldOption {
  label: string;
  value: string | number | boolean;
}

export interface EditorField {
  name: string;
  label: string;
  type: EditorFieldType;
  options?: EditorFieldOption[];
  defaultValue?: any;
  placeholder?: string;
  description?: string;
}

export interface BlockComponentProps {
  id: string;
  props: BlockProperties;
  styles?: BlockStyles;
  interactions?: BlockInteraction[];
  children?: React.ReactNode;
  isEditing: boolean;
  updateBlock: (updates: Partial<PageBlock>) => void;
}

export interface BlockConfig {
  type: BlockType;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<BlockComponentProps>;
  defaultProps: BlockProperties;
  defaultStyles?: BlockStyles;
  editorFields: EditorField[];
}


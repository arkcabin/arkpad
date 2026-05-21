import React from "react";

export type BlockProperties = Record<string, any>;

export interface Block {
  id: string;
  type: string;
  properties: BlockProperties;
}

export interface Column {
  id: string;
  width: number; // 1 to 12 column span
  blocks: Block[];
}

export interface Row {
  id: string;
  columns: Column[];
}

export interface LayoutJSON {
  rows: Row[];
}

export type EditorFieldType = "text" | "number" | "select" | "checkbox" | "textarea" | "color";

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
  properties: BlockProperties;
  updateProperties: (properties: BlockProperties) => void;
  isEditing: boolean;
}

export interface BlockConfig {
  type: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<BlockComponentProps>;
  defaultProperties: BlockProperties;
  editorFields: EditorField[];
}

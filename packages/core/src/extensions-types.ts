import { Plugin } from "prosemirror-state";
import { Schema } from "prosemirror-model";

export type Dispatch = (tr: any) => void;

export interface Extension {
  name: string;
  type?: string;
  getOptions?: () => Record<string, unknown>;
  addCommands?: () => Record<string, any>;
  addKeyboardShortcuts?: (schema: Schema) => Record<string, any>;
  addInputRules?: (schema: Schema) => any[];
  addPasteRules?: (schema: Schema) => Plugin[];
  addProseMirrorPlugins?: (schema: Schema) => Plugin[];
  addStorage?: () => Record<string, any>;
}

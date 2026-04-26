import type { Command, EditorState, Plugin } from "prosemirror-state";

export type ArkpadDocJSON = Record<string, unknown>;
export type ArkpadContent = string | ArkpadDocJSON;

export type ArkpadCommand = Command;
export type ArkpadCommandRegistry = Record<string, ArkpadCommand>;

export interface ArkpadExtension {
  name: string;
  plugins?: Plugin[];
  commands?: Partial<ArkpadCommandRegistry>;
}

export interface ArkpadEditorOptions {
  element: HTMLElement;
  content?: ArkpadContent;
  editable?: boolean;
  extensions?: ArkpadExtension[];
  autofocus?: boolean;
  onCreate?: (editor: ArkpadEditorAPI) => void;
  onUpdate?: (payload: ArkpadUpdatePayload) => void;
  onDestroy?: (editor: ArkpadEditorAPI) => void;
}

export interface ResolvedArkpadEditorOptions
  extends Omit<ArkpadEditorOptions, "content" | "extensions"> {
  content: ArkpadContent;
  extensions: ArkpadExtension[];
  editable: boolean;
  autofocus: boolean;
}

export interface ArkpadUpdatePayload {
  editor: ArkpadEditorAPI;
  state: EditorState;
  html: string;
  json: ArkpadDocJSON;
  text: string;
}

export interface ArkpadEditorAPI {
  readonly element: HTMLElement;
  readonly commands: ArkpadCommandRegistry;
  getState(): EditorState;
  getHTML(): string;
  getJSON(): ArkpadDocJSON;
  getText(): string;
  runCommand(name: string): boolean;
  canRunCommand(name: string): boolean;
  setContent(content: ArkpadContent, emitUpdate?: boolean): void;
  clearContent(emitUpdate?: boolean): void;
  focus(): void;
  blur(): void;
  setEditable(editable: boolean): void;
  isEditable(): boolean;
  registerExtension(extension: ArkpadExtension): void;
  registerExtensions(extensions: ArkpadExtension[]): void;
  destroy(): void;
}

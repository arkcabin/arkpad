import type { EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import type {
  ArkpadCommandProxy,
  ChainedCommands,
  SearchResult,
  ArkpadDocJSON,
  ArkpadContent,
} from "./services";

import type { EventEmitter } from "../core/EventEmitter";
import type { Storage } from "../core/Storage";
import type { ShortcutRegistry } from "../core/ShortcutRegistry";

export interface IArkpadEditor {
  readonly element: HTMLElement;
  readonly commands: ArkpadCommandProxy;
  readonly storage: Record<string, any>;
  readonly storageService: Storage;
  readonly shortcuts: ShortcutRegistry;
  readonly events: EventEmitter;
  readonly extensionManager: any;

  getState(): EditorState;
  getView(): EditorView;
  getHTML(): string;
  getJSON(): ArkpadDocJSON;
  getMarkdown(): string;
  getText(): string;
  isActive(name: string, attrs?: Record<string, any>): boolean;
  getAttributes(name: string): Record<string, any> | null;
  runCommand(name: string, ...args: any[]): boolean;
  canRunCommand(name: string, ...args: any[]): boolean;

  chain(): ChainedCommands;
  can(): ChainedCommands;

  setContent(content: ArkpadContent, emitUpdate?: boolean): void;
  clearContent(emitUpdate?: boolean): void;

  getSelection(): { from: number; to: number; empty: boolean };
  setSelection(range: { from: number; to: number } | number): void;
  selectAll(): void;

  getCoords(pos?: number): { top: number; left: number; bottom: number; right: number } | null;

  search(query: string | RegExp): SearchResult[];
  replace(query: string | RegExp, replacement: string): boolean;

  focus(pos?: "start" | "end" | number): void;
  blur(): void;
  setEditable(editable: boolean): void;
  isEditable(): boolean;

  saveSnapshot(name: string): void;
  restoreSnapshot(name: string): boolean;

  getGovernanceRules(): Record<string, any>;
  setVirtualSelection(
    id: string,
    options: { from: number; to: number; color: string; label?: string }
  ): void;
  removeVirtualSelection(id: string): void;

  registerExtension(extension: any): void;
  registerExtensions(extensions: any[]): void;
  unregisterExtension(name: string): void;

  subscribe(callback: (editor: IArkpadEditor) => void): () => void;
  addInterceptor(interceptor: any): void;
  addAsyncInterceptor(interceptor: any): void;
  dispatch(transaction: any): void;
  batch(callback: (editor: IArkpadEditor) => void): void;
  refresh(): void;
  destroy(): void;
}

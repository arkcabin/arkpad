import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { EventEmitter } from "./EventEmitter";
import { Storage } from "./Storage";
import { ShortcutRegistry } from "./ShortcutRegistry";
import { Governance, NodeRole } from "./Governance";
import { ExtensionManager } from "./ExtensionManager";
import { HookManager } from "./HookManager";
import { DispatchEngine } from "./DispatchEngine";
import { StateManager } from "./StateManager";
import { SelectionService } from "../services/editor/SelectionService";
import { ContentService } from "../services/editor/ContentService";
import { SearchService } from "../services/editor/SearchService";
import { BlockRegistry } from "../services/BlockRegistry";

import { createCoreEssentials } from "../extensions";
import { isMarkActive, isNodeActive, getMarkAttributes, getNodeAttributes } from "../sdk/utils";
import { CommandManager } from "../services/commands/CommandManager";
import { SchemaBuilder } from "../services/schema/schema-builder";
import {
  IArkpadEditor,
  ArkpadCommandProxy,
  ArkpadExtension,
  ArkpadContent,
  ArkpadDocJSON,
  ChainedCommands,
  SearchResult,
  ArkpadEditorOptions,
  InterceptorConfig,
  AsyncInterceptor,
  EditorSubscriptionScope,
  EditorDebugOptions,
} from "../api";
import { resolveEditorOptions } from "../utils";

export class ArkpadEditor implements IArkpadEditor {
  public readonly element: HTMLElement;
  public commands: ArkpadCommandProxy;
  public extensionManager: ExtensionManager;
  public readonly storage: Record<string, any>;
  public readonly storageService: Storage;
  public readonly shortcuts: ShortcutRegistry;
  public readonly events: EventEmitter;

  private readonly onCreate?: ArkpadEditorOptions["onCreate"];
  private readonly onUpdate?: ArkpadEditorOptions["onUpdate"];
  private readonly onTransaction?: ArkpadEditorOptions["onTransaction"];
  private readonly onSelectionUpdate?: ArkpadEditorOptions["onSelectionUpdate"];
  private readonly onPaste?: ArkpadEditorOptions["onPaste"];
  private readonly onInterceptor?: ArkpadEditorOptions["onInterceptor"];
  private readonly onDestroy?: ArkpadEditorOptions["onDestroy"];
  private readonly nodeViews: Record<string, any>;

  private interceptors: InterceptorConfig[] = [];
  private asyncInterceptors: AsyncInterceptor[] = [];
  private editable: boolean;
  private view: EditorView;
  private destroyed = false;
  private uiVersion = 0;
  private debug: EditorDebugOptions;
  private listeners = new Map<(editor: IArkpadEditor) => void, EditorSubscriptionScope>();
  private isBatching = false;
  private lastCommandLog: any[] = [];

  // Sub-Managers (The modular core)
  public readonly hookManager: HookManager;
  private readonly dispatchEngine: DispatchEngine;
  public readonly stateManager: StateManager;
  public readonly selectionService: SelectionService;
  public readonly contentService: ContentService;
  public readonly searchService: SearchService;
  public readonly blockRegistry: BlockRegistry;

  constructor(options: ArkpadEditorOptions) {
    const resolved = resolveEditorOptions(options);
    this.element = resolved.element;
    this.editable = resolved.editable;
    this.onCreate = resolved.onCreate;
    this.onUpdate = resolved.onUpdate;
    this.onTransaction = resolved.onTransaction;
    this.onSelectionUpdate = resolved.onSelectionUpdate;
    this.onPaste = resolved.onPaste;
    this.onInterceptor = resolved.onInterceptor;
    this.onDestroy = resolved.onDestroy;
    this.nodeViews = resolved.nodeViews;
    this.debug = resolved.debug;

    // 1. Initialize Sub-Managers
    this.events = new EventEmitter();
    this.hookManager = new HookManager(this);
    this.dispatchEngine = new DispatchEngine(
      this,
      this.hookManager,
      this.interceptors,
      this.asyncInterceptors
    );
    this.stateManager = new StateManager(this, this.hookManager);

    this.storageService = new Storage(this.events);
    this.shortcuts = new ShortcutRegistry(this);

    // 2. Schema & Extension Management
    const extensions = [...(resolved.extensions || []), ...createCoreEssentials()];
    const schemaBuilder = new SchemaBuilder(extensions);
    const schema = schemaBuilder.build();
    // ContentService will initialize its own serializer from the schema

    this.extensionManager = new ExtensionManager(schema, extensions);
    this.selectionService = new SelectionService(this);
    this.contentService = new ContentService(this);
    this.searchService = new SearchService(this);
    this.blockRegistry = new BlockRegistry();
    this.storage = {};

    // 3. Register Extensions & Index Hooks
    this.extensionManager.extensions.forEach((ext) => {
      if (ext.init) ext.init(this);
      if (ext.storage) this.storage[ext.name] = ext.storage;
      if (ext.onInterceptor) this.addInterceptor((p: any) => ext.onInterceptor!(p));
      if (ext.addInterceptors) ext.addInterceptors().forEach((c) => this.interceptors.push(c));
    });

    this.hookManager.indexHooks(this.extensionManager.extensions);
    this.extensionManager.storage = this.storage;
    this.extensionManager.initMenuEngine(this);
    this.commands = this.createCommandsProxy();

    // 4. Initialize View
    if (this.onInterceptor) this.addInterceptor(this.onInterceptor);

    const state = this.stateManager.createState(
      resolved.content,
      schema,
      this.extensionManager.getPlugins(),
      this.selectionService.getVirtualSelections()
    );

    // Create the content element with the specified tag (e.g. 'main')
    // This will be our editor container
    this.element = document.createElement(resolved.contentTag);
    this.element.classList.add("arkpad-editor");
    this.element.classList.add("arkpad-content");

    this.view = new EditorView(this.element, {
      state,
      editable: () => this.editable,
      nodeViews: { ...this.extensionManager.nodeViews, ...this.nodeViews },
      dispatchTransaction: (tr) => this.dispatch(tr),
    });

    (this.view as any).editor = this;
    this.onCreate?.(this);
    if (resolved.autofocus) this.focus();
  }

  // Delegate Public Methods to Sub-Managers
  public dispatch(tr: Transaction): void {
    this.dispatchEngine.dispatch(tr);
  }
  public getState() {
    return this.view.state;
  }
  public getView() {
    return this.view;
  }
  public get documentVersion() {
    return this.dispatchEngine.documentVersion;
  }

  public getHTML(): string {
    return this.contentService.getHTML();
  }

  public getJSON(): ArkpadDocJSON {
    return this.contentService.getJSON();
  }
  public getText(): string {
    return this.contentService.getText();
  }

  public getMarkdown(): string {
    return this.contentService.getMarkdown();
  }

  public runCommand(name: string, ...args: any[]): any {
    if (this.destroyed) return false;
    if (!this.isCommandAllowed(name)) return false;

    // Using chain() ensures we use the Shadow Engine and collect Telemetry
    const chain = this.chain();
    const command = (chain as any)[name];

    if (typeof command !== "function") {
      // Fallback for non-standard commands if any
      const rawCommand = this.extensionManager.commands[name];
      if (!rawCommand) return false;
      return (rawCommand as any)(...args);
    }

    return command(...args).run();
  }

  public canRunCommand(name: string, ...args: any[]): boolean {
    if (this.destroyed) return false;
    const targetName = this.extensionManager.activeMappings[name] || name;
    const markType = this.view.state.schema.marks[targetName];
    if (markType) return this.view.state.selection.$from.parent.type.allowsMarkType(markType);
    const nodeType = this.view.state.schema.nodes[targetName];
    if (nodeType) {
      const { $from, $to } = this.view.state.selection;
      const range = $from.blockRange($to);
      if (!range) return false;
      if (nodeType.isBlock) {
        const index = $from.index(range.depth);
        return $from.parent.canReplaceWith(index, index + 1, nodeType);
      }
      return true;
    }
    const command = this.extensionManager.commands[name];
    if (!command) return false;
    try {
      const result = (command as any)(...args);
      if (typeof result === "function")
        return result({
          state: this.view.state,
          dispatch: undefined,
          view: this.view,
          tr: this.view.state.tr,
          editor: this,
          chain: () => this.can(),
          can: () => this.can(),
        });
      return !!result;
    } catch {
      // Governance healing failed, likely due to document change
    }
    return false;
  }

  public getCommandAvailability(names?: string[]): Record<string, boolean> {
    const commands = names || Object.keys(this.extensionManager.commands);
    const availability: Record<string, boolean> = {};
    commands.forEach((name) => {
      availability[name] = this.canRunCommand(name);
    });
    return availability;
  }

  public chain(): ChainedCommands {
    return new CommandManager({
      state: this.view.state,
      commands: this.extensionManager.commands,
      view: this.view,
      editor: this,
      dispatch: (tr: Transaction) => {
        if (tr.steps.length > 0 || tr.selectionSet) this.view.dispatch(tr);
      },
      schema: this.extensionManager.schema,
    });
  }

  public can(): ChainedCommands {
    return new CommandManager({
      state: this.view.state,
      commands: this.extensionManager.commands,
      view: this.view,
      editor: this,
      shouldDispatch: false,
      schema: this.extensionManager.schema,
    }) as unknown as ChainedCommands;
  }

  public getSelection() {
    return this.selectionService.getSelection();
  }

  public setSelection(range: { from: number; to: number } | number) {
    this.selectionService.setSelection(range);
  }

  public selectAll() {
    this.selectionService.selectAll();
  }

  public getCoords(pos?: number) {
    return this.selectionService.getCoords(pos);
  }

  public search(query: string | RegExp): SearchResult[] {
    return this.searchService.search(query);
  }

  public replace(query: string | RegExp, replacement: string): boolean {
    return this.searchService.replace(query, replacement);
  }

  public isActive(name: string, attrs: Record<string, any> = {}): boolean {
    const { state } = this.view;

    // Special case for textAlign
    if (name === "textAlign") {
      const align = attrs.align || "left";
      return state.selection.$from.parent.attrs.align === align;
    }

    // Resolve target name from mapping or use the provided name
    const targetName = this.extensionManager.activeMappings[name] || name;

    // 1. Check if it's a Mark
    const markType = state.schema.marks[targetName];
    if (markType) {
      return isMarkActive(state, markType);
    }

    // 2. Check if it's a Node
    const nodeType = state.schema.nodes[targetName];
    if (nodeType) {
      // Use standard utility for direct active check
      if (isNodeActive(state, nodeType, attrs)) {
        return true;
      }
    }

    // 3. Fallback: Deep Hierarchy check for attributes
    // Sometimes isNodeActive might miss deeply nested or specific attribute combinations
    const { $from } = state.selection;
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === targetName || node.type === nodeType) {
        const matchesAttrs = Object.entries(attrs).every(([k, v]) => node.attrs[k] === v);
        if (matchesAttrs) return true;
      }
    }

    return false;
  }

  public getAttributes(name: string): Record<string, any> | null {
    const { state } = this.view;
    const markType = state.schema.marks[name];
    if (markType) return getMarkAttributes(state, markType);
    const nodeType = state.schema.nodes[name];
    if (nodeType) return getNodeAttributes(state, nodeType);
    return null;
  }

  public setContent(content: ArkpadContent, emitUpdate = true) {
    this.contentService.setContent(content, emitUpdate);
  }

  public clearContent(emitUpdate = true) {
    this.contentService.clearContent(emitUpdate);
  }

  public focus(pos?: "start" | "end" | number) {
    if (this.view.hasFocus() && pos === undefined) return;
    this.view.focus();
    this.events.emit("focus", { editor: this });
    if (pos === "start") this.setSelection(0);
    else if (pos === "end") this.setSelection(this.view.state.doc.content.size);
    else if (typeof pos === "number") this.setSelection(pos);
  }

  public blur() {
    (this.view.dom as HTMLElement).blur();
    this.events.emit("blur", { editor: this });
  }

  public setEditable(editable: boolean) {
    this.editable = editable;
    this.view.setProps({ editable: () => this.editable });
  }

  public isEditable() {
    return this.editable;
  }

  public isFocused() {
    if (!this.view) return false;
    if (this.view.hasFocus()) return true;

    // Fallback for some browser environments or during event transitions
    if (typeof document !== "undefined") {
      const dom = this.view.dom as HTMLElement;
      return dom.contains(document.activeElement) || document.activeElement === dom;
    }

    return false;
  }

  public saveSnapshot(name: string) {
    this.stateManager.saveSnapshot(name, this.view.state);
  }
  public restoreSnapshot(name: string): boolean {
    const state = this.stateManager.restoreSnapshot(name);
    if (!state) return false;
    this.view.updateState(state);
    this.emitUpdate(state);
    return true;
  }

  public getUpdateVersion(scope: Exclude<EditorSubscriptionScope, "all">): number {
    if (scope === "state") return this.dispatchEngine.documentVersion;
    if (scope === "ui") return this.uiVersion;
    return 0;
  }

  public shouldLogCommandRuns(): boolean {
    return !!this.debug.commandLogs;
  }

  public getCommandLog(): any[] {
    return this.lastCommandLog;
  }

  // ── Ghost Text API (AI Autocomplete) ───────────────────────────────────────

  /**
   * Sets a virtual ghost text suggestion at the current cursor position.
   */
  public setGhostText(text: string, pos?: number): boolean {
    return this.runCommand("setGhostText", text, pos);
  }

  /**
   * Accepts and materializes the current ghost text suggestion.
   */
  public acceptGhostText(): boolean {
    return this.runCommand("acceptGhostText");
  }

  /**
   * Clears the current ghost text suggestion.
   */
  public clearGhostText(): boolean {
    return this.runCommand("clearGhostText");
  }

  /**
   * Internal method to update the last command log.
   * @internal
   */
  public _setLastCommandLog(log: any[]) {
    this.lastCommandLog = log;
  }

  public setVirtualSelection(
    id: string,
    options: { from: number; to: number; color: string; label?: string }
  ) {
    this.selectionService.setVirtualSelection(id, options);
  }

  public removeVirtualSelection(id: string) {
    this.selectionService.removeVirtualSelection(id);
  }

  public addAsyncInterceptor(interceptor: AsyncInterceptor) {
    this.asyncInterceptors.push(interceptor);
  }

  public registerExtension(extension: ArkpadExtension) {
    this.extensionManager.registerExtension(extension);
    if (extension.init) extension.init(this);
    if (extension.storage) this.storage[extension.name] = extension.storage;
    if (extension.onInterceptor) this.addInterceptor((p: any) => extension.onInterceptor!(p));
    this.extensionManager.rebuild();
    this.contentService.refreshSerializer();
    this.hookManager.indexHooks(this.extensionManager.extensions);
    this.stateManager.refreshState(
      this.view.state.doc.toJSON(),
      this.extensionManager.schema,
      this.extensionManager.getPlugins()
    );
  }

  public registerExtensions(extensions: ArkpadExtension[]) {
    this.extensionManager.registerExtensions(extensions);
    extensions.forEach((ext) => {
      if (ext.init) ext.init(this);
      if (ext.storage) this.storage[ext.name] = ext.storage;
      if (ext.onInterceptor) this.addInterceptor((p: any) => ext.onInterceptor!(p));
    });
    this.extensionManager.rebuild();
    this.contentService.refreshSerializer();
    this.hookManager.indexHooks(this.extensionManager.extensions);
    this.stateManager.refreshState(
      this.view.state.doc.toJSON(),
      this.extensionManager.schema,
      this.extensionManager.getPlugins()
    );
  }

  public unregisterExtension(nameOrId: string) {
    this.extensionManager.unregisterExtension(nameOrId);
    this.extensionManager.rebuild();
    this.contentService.refreshSerializer();
    this.hookManager.indexHooks(this.extensionManager.extensions);
    this.stateManager.refreshState(
      this.view.state.doc.toJSON(),
      this.extensionManager.schema,
      this.extensionManager.getPlugins()
    );
  }

  public subscribe(
    callback: (editor: IArkpadEditor) => void,
    scope: EditorSubscriptionScope = "all"
  ): () => void {
    this.listeners.set(callback, scope);
    return () => this.listeners.delete(callback);
  }

  public refresh() {
    this.emitUpdate(this.view.state);
  }

  public getGovernanceRules() {
    const rules: Record<string, any> = {};
    const { nodes } = this.view.state.schema;

    Object.keys(nodes).forEach((key) => {
      const type = nodes[key]!;
      rules[key] = {
        role: Governance.resolveRole({ type } as any),
        allowedRoles: (type.spec as any).allowedRoles,
        group: type.spec.group,
        content: type.spec.content,
      };
    });
    return rules;
  }

  private isCommandAllowed(name: string): boolean {
    const { state } = this.view;
    const ext = this.extensionManager.commandToExtension.get(name);
    if (state.schema.marks[name] || (ext && (ext as any).config?.addMarks)) return true;
    let targetRole = NodeRole.CONTENT;
    if (ext && ext.role !== undefined) targetRole = ext.role;
    else {
      if (name.toLowerCase().includes("heading")) targetRole = NodeRole.CONTENT;
      if (name.toLowerCase().includes("list")) targetRole = NodeRole.LAYOUT;
      if (name.toLowerCase().includes("section")) targetRole = NodeRole.LAYOUT;
      if (name.toLowerCase().includes("image") || name.toLowerCase().includes("table"))
        targetRole = NodeRole.WIDGET;
    }
    const parent = state.selection.$from.parent;
    return Governance.canAccept(
      Governance.resolveRole(parent),
      targetRole,
      (parent.type.spec as any).allowedRoles
    );
  }

  private createCommandsProxy(): ArkpadCommandProxy {
    return new Proxy({} as ArkpadCommandProxy, {
      get: (_, prop: string) => {
        if (this.extensionManager.commands[prop])
          return (...args: any[]) => this.runCommand(prop, ...args);
        if (prop in this && typeof (this as any)[prop] === "function") return (this as any)[prop];
        return undefined;
      },
    });
  }

  public addInterceptor(interceptor: any) {
    if (typeof interceptor === "function")
      this.interceptors.push({ on: "all", handler: interceptor });
    else this.interceptors.push(interceptor);
  }

  public batch(callback: (editor: IArkpadEditor) => void) {
    this.isBatching = true;
    try {
      callback(this);
    } finally {
      this.isBatching = false;
      this.emitUpdate(this.view.state);
    }
  }

  public emitUiUpdate(): void {
    this.uiVersion++;
    this.listeners.forEach((scope, listener) => {
      if (scope === "all" || scope === "ui") listener(this);
    });
    this.events.emit("ui-update", { editor: this });
  }

  public emitUpdate(state: EditorState) {
    if (this.isBatching) return;
    this.onUpdate?.({ editor: this, state });
    this.listeners.forEach((scope, listener) => {
      if (scope === "all" || scope === "state") listener(this);
    });
  }

  public destroy() {
    this.hookManager.triggerDestroy();
    this.extensionManager.destroy();
    this.view.destroy();
    this.onDestroy?.(this);
    this.destroyed = true;
  }
}

export function createArkpadEditor(options: ArkpadEditorOptions) {
  return new ArkpadEditor(options);
}

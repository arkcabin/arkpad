import { DOMSerializer } from "prosemirror-model";
import { EditorState, TextSelection, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { EventEmitter } from "./EventEmitter";
import { Storage } from "./Storage";
import { ShortcutRegistry } from "./ShortcutRegistry";
import { Governance, NodeRole } from "./Governance";
import { ExtensionManager } from "./ExtensionManager";
import { HookManager } from "./HookManager";
import { DispatchEngine } from "./DispatchEngine";
import { StateManager } from "./StateManager";

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
  private virtualSelections: Map<string, any> = new Map();
  private serializer: DOMSerializer;

  private editable: boolean;
  private view: EditorView;
  private destroyed = false;
  private listeners = new Set<(editor: IArkpadEditor) => void>();
  private isBatching = false;

  // Sub-Managers (The modular core)
  private hookManager: HookManager;
  private dispatchEngine: DispatchEngine;
  private stateManager: StateManager;

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
    const extensions = [...createCoreEssentials(), ...(resolved.extensions || [])];
    const schemaBuilder = new SchemaBuilder(extensions);
    const schema = schemaBuilder.build();
    this.serializer = DOMSerializer.fromSchema(schema);

    this.extensionManager = new ExtensionManager(schema, extensions);
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
      this.virtualSelections
    );

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
    const fragment = this.serializer.serializeFragment(this.view.state.doc.content);
    const container = document.createElement("div");
    container.appendChild(fragment);
    return container.innerHTML;
  }

  public getJSON(): ArkpadDocJSON {
    return this.view.state.doc.toJSON();
  }
  public getText(): string {
    return this.view.state.doc.textBetween(0, this.view.state.doc.content.size, "\n\n");
  }

  public getMarkdown(): string {
    const markdownExtension = this.extensionManager.extensions.find((e) => e.name === "markdown");
    if (markdownExtension && (markdownExtension as any).serializer)
      return (markdownExtension as any).serializer.serialize(this.view.state.doc);
    return this.getText();
  }

  public runCommand(name: string, ...args: any[]): any {
    if (this.destroyed) return false;
    if (!this.isCommandAllowed(name)) return false;
    const command = this.extensionManager.commands[name];
    if (!command) return false;
    const result = (command as any)(...args);
    if (typeof result === "function") {
      const lastArg = args[args.length - 1];
      if (lastArg && typeof lastArg === "object" && "state" in lastArg) return result(lastArg);
      const state = this.view.state;
      return result({
        state,
        dispatch: this.view.dispatch,
        view: this.view,
        tr: state.tr,
        editor: this,
        chain: () => this.chain(),
        can: () => this.can(),
      });
    }
    return result;
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

  public chain(): ChainedCommands {
    return new CommandManager({
      state: this.view.state,
      commands: this.commands,
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
      commands: this.commands,
      view: this.view,
      editor: this,
      shouldDispatch: false,
      schema: this.extensionManager.schema,
    }) as unknown as ChainedCommands;
  }

  public getSelection() {
    const { selection } = this.view.state;
    const { from, to, empty } = selection;
    const cellSelection = selection as any;
    if (cellSelection.anchorCell && cellSelection.headCell)
      return {
        from,
        to,
        empty: false,
        isCellSelection: true,
        anchorCell: cellSelection.anchorCell,
        headCell: cellSelection.headCell,
        ranges: cellSelection.ranges,
      };
    return { from, to, empty, isCellSelection: false };
  }

  public setSelection(range: { from: number; to: number } | number) {
    const { tr } = this.view.state;
    const from = typeof range === "number" ? range : range.from;
    const to = typeof range === "number" ? range : range.to;
    this.view.dispatch(tr.setSelection(TextSelection.create(tr.doc, from, to)));
  }

  public selectAll() {
    this.setSelection({ from: 0, to: this.view.state.doc.content.size });
  }

  public getCoords(pos?: number) {
    const { state } = this.view;
    const { selection } = state;
    if (!pos && (selection as any).anchorCell) {
      try {
        const cellSelection = selection as any;
        const anchorPos =
          cellSelection.anchorCell ||
          (cellSelection.$anchorCell ? cellSelection.$anchorCell.pos : 0);
        const headPos =
          cellSelection.headCell || (cellSelection.$headCell ? cellSelection.$headCell.pos : 0);
        if (anchorPos && headPos) {
          const anchorCoords = this.view.coordsAtPos(anchorPos + 1);
          const headCoords = this.view.coordsAtPos(headPos + 1);
          return {
            top: Math.min(anchorCoords.top, headCoords.top),
            bottom: Math.max(anchorCoords.bottom, headCoords.bottom),
            left: Math.min(anchorCoords.left, headCoords.left),
            right: Math.max(anchorCoords.right, headCoords.right),
          };
        }
      } catch {
        // Coords resolution failed for cell selection
      }
    }
    const safePos = Math.max(0, Math.min(pos ?? selection.from, state.doc.content.size));
    try {
      return this.view.coordsAtPos(safePos);
    } catch {
      return null;
    }
  }

  public search(query: string | RegExp): SearchResult[] {
    const results: SearchResult[] = [];
    const regex =
      typeof query === "string"
        ? new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
        : query;
    this.view.state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const matches = node.text.matchAll(regex);
        for (const match of matches) {
          if (match.index !== undefined)
            results.push({
              from: pos + match.index,
              to: pos + match.index + match[0].length,
              text: match[0],
            });
        }
      }
      return true;
    });
    return results;
  }

  public replace(query: string | RegExp, replacement: string): boolean {
    const matches = this.search(query);
    if (matches.length === 0) return false;
    const { tr } = this.view.state;
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      if (match)
        tr.replaceWith(match.from, match.to, this.extensionManager.schema.text(replacement));
    }
    this.view.dispatch(tr);
    return true;
  }

  public isActive(name: string, attrs: Record<string, any> = {}): boolean {
    const { state } = this.view;
    if (name === "textAlign") return state.selection.$from.parent.attrs.align === attrs.align;
    const targetName = this.extensionManager.activeMappings[name] || name;
    const markType = state.schema.marks[targetName];
    if (markType) return isMarkActive(state, markType);
    const nodeType = state.schema.nodes[targetName];
    if (nodeType) return isNodeActive(state, nodeType, attrs);
    const { $from } = state.selection;
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === targetName) {
        if (Object.entries(attrs).every(([k, v]) => node.attrs[k] === v)) return true;
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
    this.stateManager.refreshState(content, this.extensionManager.schema, this.view.state.plugins);
    if (emitUpdate) this.emitUpdate(this.view.state);
  }

  public clearContent(emitUpdate = true) {
    this.setContent("<p></p>", emitUpdate);
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
    this.view.dom.blur();
    this.events.emit("blur", { editor: this });
  }

  public setEditable(editable: boolean) {
    this.editable = editable;
    this.view.setProps({ editable: () => this.editable });
  }

  public isEditable() {
    return this.editable;
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

  public setVirtualSelection(
    id: string,
    options: { from: number; to: number; color: string; label?: string }
  ) {
    this.virtualSelections.set(id, options);
    const tr = this.view.state.tr;
    tr.setMeta("virtual-selection-update", id);
    this.view.dispatch(tr);
  }

  public removeVirtualSelection(id: string) {
    this.virtualSelections.delete(id);
    const tr = this.view.state.tr;
    tr.setMeta("virtual-selection-update", id);
    this.view.dispatch(tr);
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
    this.serializer = DOMSerializer.fromSchema(this.extensionManager.schema);
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
    this.serializer = DOMSerializer.fromSchema(this.extensionManager.schema);
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
    this.serializer = DOMSerializer.fromSchema(this.extensionManager.schema);
    this.hookManager.indexHooks(this.extensionManager.extensions);
    this.stateManager.refreshState(
      this.view.state.doc.toJSON(),
      this.extensionManager.schema,
      this.extensionManager.getPlugins()
    );
  }

  public subscribe(callback: (editor: IArkpadEditor) => void): () => void {
    this.listeners.add(callback);
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

  public emitUpdate(state: EditorState) {
    if (this.isBatching) return;
    this.onUpdate?.({ editor: this, state });
    this.listeners.forEach((listener) => listener(this));
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

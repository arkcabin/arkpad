import { DOMSerializer } from "prosemirror-model";
import { EditorState, TextSelection, Transaction, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ExtensionManager } from "./extensions/ExtensionManager";

import { createCoreEssentials } from "./extensions/index";
import {
  isMarkActive,
  isNodeActive,
  getMarkAttributes,
  getNodeAttributes,
} from "./extensions/utils";
import { CommandManager } from "./commands";
import { SchemaBuilder } from "./schema-builder";
import type {
  ArkpadCommandProxy,
  ArkpadExtension,
  ArkpadContent,
  ArkpadDocJSON,
  ArkpadEditorAPI,
  ArkpadEditorOptions,
  ArkpadUpdatePayload,
  ChainedCommands,
  SearchResult,
  InterceptorConfig,
} from "./types";
import { parseContent, resolveEditorOptions } from "./utils";

/**
 * The core editor class for Arkpad.
 * Handles the ProseMirror view, state, and command execution.
 */
export class ArkpadEditor implements ArkpadEditorAPI {
  public readonly element: HTMLElement;
  public commands: ArkpadCommandProxy;
  public extensionManager: ExtensionManager;
  public readonly storage: Record<string, any>;

  private readonly onCreate?: ArkpadEditorOptions["onCreate"];
  private readonly onUpdate?: ArkpadEditorOptions["onUpdate"];
  private readonly onTransaction?: ArkpadEditorOptions["onTransaction"];
  private readonly onSelectionUpdate?: ArkpadEditorOptions["onSelectionUpdate"];
  private readonly onPaste?: ArkpadEditorOptions["onPaste"];
  private interceptors: InterceptorConfig[] = [];
  private readonly onInterceptor?: ArkpadEditorOptions["onInterceptor"];
  private readonly onDestroy?: ArkpadEditorOptions["onDestroy"];
  private readonly nodeViews: Record<string, any>;
  private serializer: DOMSerializer;

  private editable: boolean;
  private view: EditorView;
  private destroyed = false;
  private listeners = new Set<(editor: ArkpadEditorAPI) => void>();

  // Performance: Pre-indexed hooks to avoid iterating all extensions on every transaction
  private transactionHooks: ArkpadExtension[] = [];
  private updateHooks: ArkpadExtension[] = [];
  private destroyHooks: ArkpadExtension[] = [];

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
    if (this.onInterceptor) {
      this.addInterceptor(this.onInterceptor);
    }
    this.onDestroy = resolved.onDestroy;
    this.nodeViews = resolved.nodeViews;

    // 1. Collect Extensions and Build Dynamic Schema
    const extensions = [...createCoreEssentials(), ...(resolved.extensions || [])];

    const schemaBuilder = new SchemaBuilder(extensions);
    const schema = schemaBuilder.build();

    this.serializer = DOMSerializer.fromSchema(schema);

    // 2. Initialize Extension Manager with the new Schema
    const extensionManager = new ExtensionManager(schema, extensions);

    this.extensionManager = extensionManager;

    // 3. Boot Extensions & Index Hooks (Performance Optimization)
    this.storage = {};
    extensionManager.extensions.forEach((ext) => {
      if (ext.init) {
        ext.init(this);
      }
      if (ext.storage) {
        this.storage[ext.name] = ext.storage;
      }
      if (ext.onInterceptor) {
        this.addInterceptor((props) => ext.onInterceptor!(props));
      }
      if (ext.addInterceptors) {
        ext.addInterceptors().forEach((config) => this.interceptors.push(config));
      }
      if (ext.onTransaction) {
        this.transactionHooks.push(ext);
      }
      if (ext.onUpdate) {
        this.updateHooks.push(ext);
      }
      if (ext.onDestroy) {
        this.destroyHooks.push(ext);
      }
    });

    extensionManager.storage = this.storage;

    // 3. Setup Commands Proxy (The DX "Secret Sauce")
    this.commands = this.createCommandsProxy();

    const state = this.createState(resolved.content);

    this.view = new EditorView(this.element, {
      state,
      editable: () => this.editable,
      nodeViews: this.nodeViews,
      dispatchTransaction: (transaction) => {
        if (this.destroyed) return;

        let tr = transaction;

        // Run Interceptors (Middleware)
        for (const config of this.interceptors) {
          // Performance Optimization: Skip interceptors that don't match the transaction type
          if (config.on === "docChanged" && !tr.docChanged) continue;
          if (config.on === "selectionChanged" && !tr.selectionSet) continue;

          const intercepted = config.handler({ editor: this, transaction: tr });

          if (intercepted === false || intercepted === null) {
            return; // Cancel transaction
          }

          if (intercepted instanceof Transaction) {
            tr = intercepted;
          }
        }

        // Call onTransaction hook
        this.onTransaction?.({ editor: this, transaction: tr });

        // Trigger onTransaction lifecycle for indexed extensions ONLY (Fast Path)
        for (const ext of this.transactionHooks) {
          ext.onTransaction!({ editor: this, transaction: tr });
        }

        // Trigger onSelectionUpdate if selection changed
        if (tr.selectionSet && this.onSelectionUpdate) {
          this.onSelectionUpdate({
            editor: this,
            transaction: tr,
            coords: this.getCoords(tr.selection.from),
          });
        }

        const nextState = this.view.state.apply(tr);
        this.view.updateState(nextState);

        // Trigger onUpdate lifecycle for indexed extensions ONLY (Fast Path)
        for (const ext of this.updateHooks) {
          ext.onUpdate!({ editor: this });
        }

        this.emitUpdate(nextState);
      },
    });

    this.onCreate?.(this);

    if (resolved.autofocus) {
      this.focus();
    }
  }

  private createState(content: ArkpadContent) {
    const { schema } = this.extensionManager;
    const parsedDoc = parseContent(content, schema);
    const plugins = [...this.extensionManager.getPlugins()];

    // Add Paste Interceptor Plugin
    plugins.push(
      new Plugin({
        props: {
          handlePaste: (view, event, slice) => {
            if (this.onPaste) {
              return this.onPaste({ editor: this, event, slice }) === true;
            }
            return false;
          },
        },
      })
    );

    // Add Painting Tool Deactivation Plugin
    plugins.push(
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          // Optimization: Skip if no structural changes
          const hasStructuralChange = transactions.some(
            (tr) => tr.docChanged || tr.getMeta("deactivate-painting-tools") === true
          );

          if (hasStructuralChange) {
            const tr = newState.tr;
            tr.setMeta("deactivate-painting-tools", true);
            // We use string-based meta keys to avoid direct dependency on extension packages
            tr.setMeta("highlighter", false);
            tr.setMeta("eraser", false);
            return tr;
          }

          return null;
        },
      })
    );

    return EditorState.create({
      schema,
      doc: parsedDoc,
      plugins,
    });
  }

  private refreshState(content: ArkpadContent = this.view.state.doc.toJSON()) {
    const { schema } = this.extensionManager;
    const nextState = EditorState.create({
      schema,
      doc: parseContent(content, schema),
      plugins: this.extensionManager.getPlugins(),
    });
    this.view.updateState(nextState);

    // Performance: Re-index hooks on refresh
    this.transactionHooks = [];
    this.updateHooks = [];
    this.extensionManager.extensions.forEach((ext) => {
      if (ext.onTransaction) this.transactionHooks.push(ext);
      if (ext.onUpdate) this.updateHooks.push(ext);
    });

    this.emitUpdate(nextState);

    return nextState;
  }

  private emitUpdate(state: EditorState) {
    const payload: ArkpadUpdatePayload = {
      editor: this,
      state,
      // Performance: DO NOT call getHTML() or getJSON() here.
      // They are expensive and cause the UI to hang.
    };

    this.onUpdate?.(payload);

    // Notify all subscribers
    this.listeners.forEach((listener) => listener(this));
  }

  /**
   * Returns the current editor state.
   */
  getState() {
    return this.view.state;
  }

  /**
   * Returns the ProseMirror EditorView.
   */
  getView() {
    return this.view;
  }

  /**
   * Returns the document as an HTML string.
   */
  getHTML(): string {
    const fragment = this.serializer.serializeFragment(this.view.state.doc.content);
    const container = document.createElement("div");
    container.appendChild(fragment);
    return container.innerHTML;
  }

  /**
   * Returns the document as a JSON object.
   */
  getJSON(): ArkpadDocJSON {
    return this.view.state.doc.toJSON();
  }

  /**
   * Returns the document as plain text.
   */
  getText(): string {
    return this.view.state.doc.textBetween(0, this.view.state.doc.content.size, "\n\n");
  }

  /**
   * Returns the document as a Markdown string.
   */
  getMarkdown(): string {
    // We look for the markdown extension in the manager to avoid circular dependency
    const markdownExtension = this.extensionManager.extensions.find((e) => e.name === "markdown");
    if (markdownExtension && (markdownExtension as any).serializer) {
      return (markdownExtension as any).serializer.serialize(this.view.state.doc);
    }

    console.warn("[Arkpad] Markdown extension not found. Returning plain text.");
    return this.getText();
  }

  /**
   * Runs a specific command by name.
   */
  runCommand(name: string, ...args: any[]): any {
    if (this.destroyed) return false;

    const command = this.extensionManager.commands[name];
    if (!command) {
      console.warn(`[Arkpad] Command "${name}" not found.`);
      return false;
    }

    const result = (command as any)(...args);

    if (typeof result === "function") {
      const lastArg = args[args.length - 1];
      const hasProps =
        lastArg && typeof lastArg === "object" && "state" in lastArg && "dispatch" in lastArg;

      if (hasProps) {
        return result(lastArg);
      }

      // Performance: Always use fresh state from view
      const state = this.view.state;
      const props = {
        state,
        dispatch: this.view.dispatch,
        view: this.view,
        tr: state.tr,
        editor: this,
        chain: () => this.chain(),
        can: () => this.can(),
      };
      return result(props);
    }

    return result;
  }

  /**
   * Checks if a command can be executed without actually running it.
   */
  canRunCommand(name: string, ...args: any[]): boolean {
    if (this.destroyed) return false;

    // Smart Mapping: Check if 'name' is a command and map it to a mark/node
    let targetName = name;
    if (this.extensionManager.activeMappings[name]) {
      targetName = this.extensionManager.activeMappings[name];
    }

    // Check if it's a Mark toggle
    const markType = this.view.state.schema.marks[targetName];
    if (markType) {
      return this.view.state.selection.$from.parent.type.allowsMarkType(markType);
    }

    // Check if it's a Node toggle
    const nodeType = this.view.state.schema.nodes[targetName];
    if (nodeType) {
      // Check if the current selection can be wrapped in or converted to this node type
      const { $from, $to } = this.view.state.selection;
      const range = $from.blockRange($to);
      if (!range) return false;

      // For block nodes, check if they can be applied at this position
      if (nodeType.isBlock) {
        // Check if we can wrap or replace the current block
        const index = $from.index(range.depth);
        return $from.parent.canReplaceWith(index, index + 1, nodeType);
      }
      return true;
    }

    // Special Case: Block Toggles (fallback)
    if (
      name === "toggleHeading" ||
      name === "toggleBlockquote" ||
      name === "toggleBulletList" ||
      name === "toggleOrderedList"
    ) {
      return true;
    }

    const command = this.extensionManager.commands[name];
    if (!command) return false;

    try {
      const { state } = this.view;
      const result = (command as any)(...args);

      if (typeof result === "function") {
        return result({
          state,
          dispatch: undefined,
          view: this.view,
          tr: state.tr,
          editor: this,
          chain: () => this.chain().command(({ dispatch }) => dispatch === undefined),
          can: () => this.can(),
        });
      }
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Returns a command chain.
   */
  chain(): ChainedCommands {
    return new CommandManager({
      state: this.view.state,
      commands: this.commands,
      view: this.view,
      // Use the REAL dispatch. CommandManager should dispatch the master transaction directly.
      dispatch: (tr: Transaction) => {
        if (tr.steps.length > 0) {
          try {
            this.view.dispatch(tr);
          } catch (e) {
            console.warn("[Arkpad] Dispatch failed:", e);
          }
        }
      },
      schema: this.extensionManager.schema,
    });
  }

  /**
   * Returns a command chain to check if multiple commands can be executed.
   */
  can(): ChainedCommands {
    return new CommandManager({
      state: this.view.state,
      commands: this.commands,
      view: this.view,
      shouldDispatch: false,
      schema: this.extensionManager.schema,
    }) as unknown as ChainedCommands;
  }

  /**
   * Selection API
   */
  getSelection() {
    const { from, to, empty } = this.view.state.selection;
    return { from, to, empty };
  }

  setSelection(range: { from: number; to: number } | number) {
    const { tr } = this.view.state;
    const from = typeof range === "number" ? range : range.from;
    const to = typeof range === "number" ? range : range.to;

    this.view.dispatch(tr.setSelection(TextSelection.create(tr.doc, from, to)));
  }

  selectAll() {
    this.setSelection({ from: 0, to: this.view.state.doc.content.size });
  }

  /**
   * Coordinate API
   */
  getCoords(pos?: number) {
    const { state } = this.view;
    const docSize = state.doc.content.size;
    const position = pos ?? state.selection.from;

    // Safety guard: Clamp position to document bounds
    const safePos = Math.max(0, Math.min(position, docSize));

    try {
      return this.view.coordsAtPos(safePos);
    } catch (error) {
      console.warn("Arkpad: Failed to get coordinates at pos", safePos, error);
      return null;
    }
  }

  /**
   * Search & Replace API
   */
  search(query: string | RegExp): SearchResult[] {
    const results: SearchResult[] = [];
    const regex =
      typeof query === "string"
        ? new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi") // Escape string for literal matching
        : query;

    this.view.state.doc.descendants((node, pos) => {
      if (node.isText && node.text) {
        const matches = node.text.matchAll(regex);
        for (const match of matches) {
          if (match.index !== undefined) {
            results.push({
              from: pos + match.index,
              to: pos + match.index + match[0].length,
              text: match[0],
            });
          }
        }
      }
      return true;
    });

    return results;
  }

  replace(query: string | RegExp, replacement: string): boolean {
    const matches = this.search(query);
    if (matches.length === 0) return false;

    const { tr } = this.view.state;
    // Apply in reverse order to keep positions valid
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      if (match) {
        tr.replaceWith(match.from, match.to, this.extensionManager.schema.text(replacement));
      }
    }

    // Apply transaction directly, bypassing interceptor for internal API calls
    const nextState = this.view.state.apply(tr);
    this.view.updateState(nextState);
    this.emitUpdate(nextState);
    return true;
  }

  /**
   * Checks if a specific mark or node is active at the current selection.
   */
  isActive(name: string, attrs: Record<string, any> = {}): boolean {
    const { state } = this.view;

    // Special Case: Text Alignment
    if (name === "textAlign") {
      const { $from } = state.selection;
      return $from.parent.attrs.align === attrs.align;
    }

    // Smart Mapping: Check if 'name' is a command and map it to a mark/node
    let targetName = name;
    if (this.extensionManager.activeMappings[name]) {
      targetName = this.extensionManager.activeMappings[name];
    }

    // Check for Marks (bold, italic, etc.)
    const markType = state.schema.marks[targetName];
    if (markType) {
      return isMarkActive(state, markType);
    }

    // Check for Nodes (heading, blockquote, etc.)
    const nodeType = state.schema.nodes[targetName];
    if (nodeType) {
      return isNodeActive(state, nodeType, attrs);
    }

    // Fallback: Check if ANY parent node matches the attributes
    const { $from } = state.selection;
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === targetName) {
        const hasMatchingAttrs = Object.entries(attrs).every(
          ([key, value]) => node.attrs[key] === value
        );
        if (hasMatchingAttrs) return true;
      }
    }

    return false;
  }

  /**
   * Gets the attributes of an active mark or node at the current selection.
   */
  getAttributes(name: string): Record<string, any> | null {
    const { state } = this.view;

    const markType = state.schema.marks[name];
    if (markType) {
      return getMarkAttributes(state, markType);
    }

    const nodeType = state.schema.nodes[name];
    if (nodeType) {
      return getNodeAttributes(state, nodeType);
    }

    return null;
  }

  /**
   * Sets the editor content.
   */
  setContent(content: ArkpadContent, format?: "html" | "markdown" | "json", emitUpdate = true) {
    const { schema } = this.extensionManager;
    const parsedDoc = parseContent(content, schema, format);
    const state = this.view.state;
    const nextState = EditorState.create({
      schema,
      doc: parsedDoc,
      plugins: state.plugins,
    });
    this.view.updateState(nextState);
    if (emitUpdate) {
      this.emitUpdate(nextState);
    }
  }

  /**
   * Clears the editor content.
   */
  clearContent(emitUpdate = true) {
    this.setContent("<p></p>", undefined, emitUpdate);
  }

  /**
   * Focuses the editor.
   */
  focus(pos?: "start" | "end" | number) {
    if (this.view.hasFocus() && pos === undefined) return;

    this.view.focus();

    if (pos === "start") {
      this.setSelection(0);
    } else if (pos === "end") {
      this.setSelection(this.view.state.doc.content.size);
    } else if (typeof pos === "number") {
      this.setSelection(pos);
    }
  }

  /**
   * Blurs the editor.
   */
  blur() {
    this.view.dom.blur();
  }

  /**
   * Sets the editable state of the editor.
   */
  setEditable(editable: boolean) {
    this.editable = editable;
    this.view.setProps({ editable: () => this.editable });
  }

  /**
   * Returns whether the editor is editable.
   */
  isEditable() {
    return this.editable;
  }

  /**
   * Registers a new extension.
   */
  registerExtension(extension: ArkpadExtension) {
    this.extensionManager.registerExtension(extension);

    if (extension.init) {
      extension.init(this);
    }
    if (extension.storage) {
      this.storage[extension.name] = extension.storage;
    }
    if (extension.onInterceptor) {
      this.addInterceptor((props) => extension.onInterceptor!(props));
    }

    this.extensionManager.rebuild();
    this.serializer = DOMSerializer.fromSchema(this.extensionManager.schema);
    this.refreshState(this.view.state.doc.toJSON());
  }

  /**
   * Registers multiple extensions.
   */
  registerExtensions(extensions: ArkpadExtension[]) {
    this.extensionManager.registerExtensions(extensions);

    extensions.forEach((ext) => {
      if (ext.init) {
        ext.init(this);
      }
      if (ext.storage) {
        this.storage[ext.name] = ext.storage;
      }
      if (ext.onInterceptor) {
        this.addInterceptor((props) => ext.onInterceptor!(props));
      }
    });

    this.extensionManager.rebuild();
    this.serializer = DOMSerializer.fromSchema(this.extensionManager.schema);
    this.refreshState(this.view.state.doc.toJSON());
  }

  /**
   * Unregisters an extension by name or unique ID.
   */
  unregisterExtension(nameOrId: string) {
    this.extensionManager.unregisterExtension(nameOrId);
    this.extensionManager.rebuild();
    this.serializer = DOMSerializer.fromSchema(this.extensionManager.schema);
    this.refreshState(this.view.state.doc.toJSON());
  }

  /**
   * Subscribes to editor updates.
   * @param callback The function to call on update.
   * @returns A cleanup function to unsubscribe.
   */
  subscribe(callback: (editor: ArkpadEditorAPI) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Internal helper to create the commands proxy for superior DX.
   */
  private createCommandsProxy(): ArkpadCommandProxy {
    return new Proxy({} as ArkpadCommandProxy, {
      get: (_, prop: string) => {
        const command =
          this.extensionManager.commands[prop as keyof typeof this.extensionManager.commands];
        if (command) {
          return (...args: unknown[]) => this.runCommand(prop, ...args);
        }
        if (prop in this && typeof (this as any)[prop] === "function") {
          return (this as any)[prop];
        }
        return undefined;
      },
    });
  }

  /**
   * Registers a new interceptor.
   */
  addInterceptor(
    interceptor:
      | ((props: {
          editor: ArkpadEditorAPI;
          transaction: Transaction;
        }) => Transaction | boolean | null)
      | InterceptorConfig
  ) {
    if (typeof interceptor === "function") {
      this.interceptors.push({ on: "all", handler: interceptor });
    } else {
      this.interceptors.push(interceptor);
    }
  }

  /**
   * Destroys the editor instance.
   */
  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.listeners.clear();

    // Call onDestroy lifecycle for all indexed extensions
    for (const ext of this.destroyHooks) {
      ext.onDestroy!();
    }

    this.view.destroy();
    this.onDestroy?.(this);
  }
}

/**
 * Helper function to create an Arkpad editor instance.
 */
export function createArkpadEditor(options: ArkpadEditorOptions) {
  return new ArkpadEditor(options);
}

import { DOMSerializer } from "prosemirror-model";
import { EditorState, TextSelection, Transaction, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { arkpadSchema } from "./schema";
import {
  ExtensionManager,
  createEssentials,
  type Extension,
  isMarkActive,
  isNodeActive,
  getMarkAttributes,
  getNodeAttributes,
} from "./extensions";
import { defaultMarkdownSerializer } from "./extensions/markdown/serializer";
import { CommandManager } from "./commands";
import { SchemaBuilder } from "./schema-builder";
import type {
  ArkpadCommandProxy,
  ArkpadCommandRegistry,
  ArkpadContent,
  ArkpadDocJSON,
  ArkpadEditorAPI,
  ArkpadEditorOptions,
  ArkpadUpdatePayload,
  ChainedCommands,
  SearchResult,
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
  private readonly onInterceptor?: ArkpadEditorOptions["onInterceptor"];
  private readonly onDestroy?: ArkpadEditorOptions["onDestroy"];
  private readonly nodeViews: Record<string, any>;
  private readonly serializer: DOMSerializer;

  private editable: boolean;
  private view: EditorView;
  private destroyed = false;
  private listeners = new Set<(editor: ArkpadEditorAPI) => void>();

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

    // 1. Collect Extensions and Build Dynamic Schema
    const extensions = [
      ...createEssentials(),
      ...(resolved.extensions || []),
    ];

    const schemaBuilder = new SchemaBuilder(extensions);
    const schema = schemaBuilder.build();
    
    this.serializer = DOMSerializer.fromSchema(schema);

    // 2. Initialize Extension Manager with the new Schema
    const extensionManager = new ExtensionManager(schema, extensions);

    this.extensionManager = extensionManager;
    this.storage = extensionManager.storage;

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

        // Run Interceptor (Middleware)
        if (this.onInterceptor) {
          const intercepted = this.onInterceptor({ editor: this, transaction: tr });

          if (intercepted === false || intercepted === null) {
            return; // Cancel transaction
          }

          if (intercepted instanceof Transaction) {
            tr = intercepted;
          }
        }

        // Call onTransaction hook
        this.onTransaction?.({ editor: this, transaction: tr });

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
        
        // Trigger onUpdate lifecycle for all extensions
        this.extensionManager.extensions.forEach(ext => {
          if (ext.onUpdate) {
            ext.onUpdate({ editor: this });
          }
        });

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
    return nextState;
  }

  private emitUpdate(state: EditorState) {
    const payload: ArkpadUpdatePayload = {
      editor: this,
      state,
      html: this.getHTML(),
      json: this.getJSON(),
      text: this.getText(),
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
    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }

  /**
   * Runs a specific command by name.
   */
  runCommand(name: string, ...args: any[]): boolean {
    if (this.destroyed) return false;

    const command = this.commands[name];
    if (!command) return false;

    const result = (command as any)(...args);

    if (typeof result === "function") {
      return result(this.view.state, this.view.dispatch, this.view);
    }

    return result;
  }

  /**
   * Checks if a command can be executed without actually running it.
   */
  canRunCommand(name: string, ...args: any[]): boolean {
    const command = this.commands[name];
    if (!command) return false;

    try {
      return (command as any)(...args)(this.view.state, undefined, this.view);
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
      dispatch: (tr) => this.view.dispatch(tr),
    }) as unknown as ChainedCommands;
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
    const position = pos ?? this.view.state.selection.from;
    return this.view.coordsAtPos(position);
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

    // Check for Marks (bold, italic, etc.)
    const markType = state.schema.marks[name];
    if (markType) {
      return isMarkActive(state, markType);
    }

    // Check for Nodes (heading, blockquote, etc.)
    const nodeType = state.schema.nodes[name];
    if (nodeType) {
      return isNodeActive(state, nodeType, attrs);
    }

    // Fallback: Check if ANY parent node matches the attributes
    const { $from } = state.selection;
    for (let depth = $from.depth; depth >= 0; depth--) {
      const node = $from.node(depth);
      if (node.type.name === name) {
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
  registerExtension(extension: Extension) {
    this.extensionManager.registerExtension(extension);
    this.refreshState(this.view.state.doc.toJSON());
  }

  /**
   * Registers multiple extensions.
   */
  registerExtensions(extensions: Extension[]) {
    this.extensionManager.registerExtensions(extensions);
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
  private createCommandsProxy(): any {
    return new Proxy(
      {},
      {
        get: (_, prop: string) => {
          if (this.extensionManager.commands[prop]) {
            return (...args: any[]) => this.runCommand(prop, ...args);
          }
          return undefined;
        },
      }
    );
  }

  /**
   * Destroys the editor instance.
   */
  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.listeners.clear();
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

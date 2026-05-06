import { DOMSerializer } from "prosemirror-model";
import { EditorState, TextSelection, Transaction, Plugin, NodeSelection } from "prosemirror-state";
import { EditorView, DecorationSet, Decoration } from "prosemirror-view";
import { EventEmitter } from "./EventEmitter";
import { Storage } from "./Storage";
import { ShortcutRegistry } from "./ShortcutRegistry";
import { Governance, NodeRole, HealingAction } from "./Governance";
import { ExtensionManager } from "./ExtensionManager";

declare const process: any;

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
  ArkpadUpdatePayload,
  InterceptorConfig,
} from "../api";
import { parseContent, resolveEditorOptions } from "../utils";

export type AsyncInterceptor = (props: {
  editor: IArkpadEditor;
  transaction: Transaction;
}) => Promise<boolean | Transaction | null>;

/**
 * The core editor class for Arkpad.
 * Handles the ProseMirror view, state, and command execution.
 */
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
  private interceptors: InterceptorConfig[] = [];
  private asyncInterceptors: AsyncInterceptor[] = [];
  private virtualSelections: Map<
    string,
    { from: number; to: number; color: string; label?: string }
  > = new Map();
  private readonly onInterceptor?: ArkpadEditorOptions["onInterceptor"];
  private readonly onDestroy?: ArkpadEditorOptions["onDestroy"];
  private readonly nodeViews: Record<string, any>;
  private serializer: DOMSerializer;

  private editable: boolean;
  private view: EditorView;
  private destroyed = false;
  private listeners = new Set<(editor: IArkpadEditor) => void>();
  private snapshots: Record<string, EditorState> = {};
  private isBatching = false;
  private isPending = false;
  private isDispatching = false;
  private dispatchQueue: Transaction[] = [];
  private dispatchTimeout = 500; // Default 500ms for async middleware

  // Performance: Pre-indexed hooks to avoid iterating all extensions on every transaction
  private transactionHooks: ArkpadExtension[] = [];
  private selectionHooks: ArkpadExtension[] = [];
  private updateHooks: ArkpadExtension[] = [];
  private destroyHooks: ArkpadExtension[] = [];

  // Native Event Hooks
  private eventHooks: {
    onClick: ArkpadExtension[];
    onDoubleClick: ArkpadExtension[];
    onKeyDown: ArkpadExtension[];
    onDrop: ArkpadExtension[];
    onPaste: ArkpadExtension[];
    onFocus: ArkpadExtension[];
    onBlur: ArkpadExtension[];
  } = {
    onClick: [],
    onDoubleClick: [],
    onKeyDown: [],
    onDrop: [],
    onPaste: [],
    onFocus: [],
    onBlur: [],
  };

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

    // 0. Initialize Core Services
    this.events = new EventEmitter();
    this.storageService = new Storage(this.events);
    this.shortcuts = new ShortcutRegistry(this);

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
      if (ext.onSelection) {
        this.selectionHooks.push(ext);
      }
      if (ext.onUpdate) {
        this.updateHooks.push(ext);
      }
      if (ext.onDestroy) {
        this.destroyHooks.push(ext);
      }

      // Index native event hooks
      if (ext.onClick) this.eventHooks.onClick.push(ext);
      if (ext.onDoubleClick) this.eventHooks.onDoubleClick.push(ext);
      if (ext.onKeyDown) this.eventHooks.onKeyDown.push(ext);
      if (ext.onDrop) this.eventHooks.onDrop.push(ext);
      if (ext.onPaste) this.eventHooks.onPaste.push(ext);
      if (ext.onFocus) this.eventHooks.onFocus.push(ext);
      if (ext.onBlur) this.eventHooks.onBlur.push(ext);
    });

    extensionManager.storage = this.storage;

    // 3. Initialize Menu Engine (Core Positioning Service)
    this.extensionManager.initMenuEngine(this);

    // 4. Setup Commands Proxy (The DX "Secret Sauce")
    this.commands = this.createCommandsProxy();

    const state = this.createState(resolved.content);

    this.view = new EditorView(this.element, {
      state,
      editable: () => this.editable,
      nodeViews: {
        ...this.extensionManager.nodeViews,
        ...this.nodeViews,
      },
      dispatchTransaction: (transaction) => {
        this.dispatch(transaction);
      },
    });

    // Attach editor instance to view for access in node views
    (this.view as any).editor = this;

    this.onCreate?.(this);

    if (resolved.autofocus) {
      this.focus();
    }
  }

  /**
   * Central Dispatch Pipeline
   * Handles async middleware, sync interceptors, and governance.
   */
  public dispatch(transaction: Transaction): void {
    if (this.destroyed) return;

    // 1. Global Recursion Guard: Prevent re-entrant calls
    if (this.isDispatching) {
      // Logic: If we are already dispatching, we should probably ignore selection-only
      // updates to avoid infinite loops, but structural changes should NEVER be dropped.
      // For now, we block all re-entry to maintain strict state integrity.
      return;
    }
    this.isDispatching = true;

    try {
      let tr = transaction;

      // 2. Pulse: Emit pre-dispatch event
      this.events.emit("transaction:pre", { editor: this, transaction: tr });

      // 3. Async Middleware Pipeline (Fired in background to keep UI sync)
      if (this.asyncInterceptors.length > 0) {
        this.runAsyncPipeline(tr);
      }

      // 4. Run Sync Interceptors
      for (const config of this.interceptors) {
        if (config.on === "docChanged" && !tr.docChanged) continue;
        if (config.on === "selectionChanged" && !tr.selectionSet) continue;
        const intercepted = config.handler({ editor: this, transaction: tr });
        if (intercepted === false || intercepted === null) return;
        if (intercepted instanceof Transaction) tr = intercepted;
      }

      // 5. Finalize & Commit (Synchronous)
      this.commit(tr);
    } finally {
      this.isDispatching = false;
    }
  }

  /**
   * Runs the async interceptor pipeline in the background.
   */
  private async runAsyncPipeline(tr: Transaction) {
    this.isPending = true;
    this.events.emit("dispatch:pending", { editor: this, isPending: true });

    try {
      const middlewarePromise = (async () => {
        for (const interceptor of this.asyncInterceptors) {
          const result = await interceptor({ editor: this, transaction: tr });
          if (result === false || result === null) return null;
          // Note: Async middleware results after the sync commit are ignored
          // or would require a new follow-up transaction.
        }
        return true;
      })();

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), this.dispatchTimeout)
      );

      const result = await Promise.race([middlewarePromise, timeoutPromise]);

      if (result === null) {
        console.warn("[Arkpad] Async background middleware timed out or blocked.");
      }
    } finally {
      this.isPending = false;
      this.events.emit("dispatch:pending", { editor: this, isPending: false });
    }
  }

  /**
   * Internal method to commit the transaction to the view.
   */
  private commit(tr: Transaction) {
    // Structural Governance Sentinel (Dev-Only warning)
    if (tr.docChanged && typeof process !== "undefined" && process.env.NODE_ENV === "development") {
      this.runGovernanceSentinel(tr);
    }

    this.onTransaction?.({ editor: this, transaction: tr });
    for (const ext of this.transactionHooks) {
      ext.onTransaction!({ editor: this, transaction: tr });
    }

    this.events.emit("transaction", { editor: this, transaction: tr });
    if (tr.docChanged) this.events.emit("transaction:doc", { editor: this, transaction: tr });

    if (tr.selectionSet) {
      const { from } = tr.selection;
      const node = (tr.selection as any).node || tr.selection.$from.parent;
      this.events.emit("selection", {
        editor: this,
        transaction: tr,
        node,
        pos: from,
        coords: this.getCoords(from),
      });
      for (const ext of this.selectionHooks) {
        ext.onSelection!({ editor: this, transaction: tr, node, pos: from });
      }
      if (this.onSelectionUpdate) {
        this.onSelectionUpdate({ editor: this, transaction: tr, coords: this.getCoords(from) });
      }
    }

    const nextState = this.view.state.apply(tr);
    this.view.updateState(nextState);

    for (const ext of this.updateHooks) {
      ext.onUpdate!({ editor: this });
    }
    this.extensionManager.menuEngine?.update(this.view, undefined);
    this.emitUpdate(nextState);
  }

  private runGovernanceSentinel(tr: Transaction) {
    try {
      tr.steps.forEach((_step, index) => {
        const map = tr.mapping.maps[index];
        if (!map) return;
        map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
          tr.doc.nodesBetween(newStart, newEnd, (node, pos, parent) => {
            if (parent) {
              const parentRole = Governance.resolveRole(parent);
              const childRole = Governance.resolveRole(node);
              const allowedMask = (parent.type.spec as any).allowedRoles;
              if (!Governance.canAccept(parentRole, childRole, allowedMask)) {
                console.warn(
                  `[Arkpad Governance] Invalid nesting at ${pos}: ${node.type.name} in ${parent.type.name}`
                );
              }
            }
            return true;
          });
        });
      });
    } catch (e) {
      console.error("[Arkpad Governance] Sentinel error:", e);
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
          handlePaste: (_view, event, slice) => {
            if (this.onPaste) {
              return this.onPaste({ editor: this as any, event, slice }) === true;
            }

            // Also check indexed extension paste hooks
            for (const ext of this.eventHooks.onPaste) {
              if (ext.onPaste!(event, slice) === true) return true;
            }

            return false;
          },
          handleKeyDown: (_view, event) => {
            for (const ext of this.eventHooks.onKeyDown) {
              if (ext.onKeyDown!(event) === true) return true;
            }
            return false;
          },
          handleClick: (_view, pos, event) => {
            for (const ext of this.eventHooks.onClick) {
              if (ext.onClick!(event, pos) === true) return true;
            }
            return false;
          },
          handleDoubleClick: (_view, pos, event) => {
            for (const ext of this.eventHooks.onDoubleClick) {
              if (ext.onDoubleClick!(event, pos) === true) return true;
            }
            return false;
          },
          handleDrop: (_view, event, slice, moved) => {
            for (const ext of this.eventHooks.onDrop) {
              if (ext.onDrop!(event, slice, moved) === true) return true;
            }
            return false;
          },
        },
      })
    );

    // Add Ghost Selection Plugin
    plugins.push(
      new Plugin({
        props: {
          decorations: (state) => {
            const decorations: Decoration[] = [];
            this.virtualSelections.forEach((val) => {
              const { from, to, color, label } = val;
              const docSize = state.doc.content.size;
              const safeFrom = Math.max(0, Math.min(from, docSize));
              const safeTo = Math.max(0, Math.min(to, docSize));

              if (safeFrom === safeTo) {
                // Render as Cursor
                const cursor = document.createElement("span");
                cursor.className = "ark-ghost-cursor";
                cursor.style.borderLeft = `2px solid ${color}`;
                cursor.style.height = "1.2em";
                cursor.style.marginLeft = "-1px";
                cursor.style.position = "relative";
                cursor.style.pointerEvents = "none";
                cursor.style.display = "inline-block";
                cursor.style.verticalAlign = "middle";

                if (label) {
                  const tag = document.createElement("span");
                  tag.className = "ark-ghost-label";
                  tag.textContent = label;
                  tag.style.position = "absolute";
                  tag.style.top = "-1.4em";
                  tag.style.left = "0";
                  tag.style.fontSize = "10px";
                  tag.style.padding = "1px 4px";
                  tag.style.borderRadius = "2px";
                  tag.style.color = "white";
                  tag.style.whiteSpace = "nowrap";
                  tag.style.background = color;
                  cursor.appendChild(tag);
                }

                decorations.push(Decoration.widget(safeFrom, cursor));
              } else {
                // Render as Highlight
                decorations.push(
                  Decoration.inline(safeFrom, safeTo, {
                    style: `background-color: ${color}33; border-bottom: 2px solid ${color}`,
                    class: "ark-ghost-selection",
                  })
                );
              }
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      })
    );

    // Add Painting Tool Deactivation Plugin
    plugins.push(
      new Plugin({
        appendTransaction: (transactions, oldState, newState) => {
          // 1. Recursion Guard: Ignore if this is already a healing transaction
          const isHealing = transactions.some((tr) => tr.getMeta("governance-healing") === true);
          if (isHealing) return null;

          // 2. Identify structural changes
          const hasStructuralChange = transactions.some((tr) => tr.docChanged);
          if (!hasStructuralChange) return null;

          const tr = newState.tr;
          const docSize = newState.doc.content.size;
          const ranges: { from: number; to: number }[] = [];
          const violations: { pos: number; action: HealingAction; typeName: string }[] = [];
          const seenViolations = new Set<string>();

          // 3. Impact Zone Sentinel: collect changed ranges in the final document
          transactions.forEach((transaction) => {
            transaction.steps.forEach((step) => {
              const map = step.getMap();
              map.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                const from = Math.max(0, Math.min(newStart, docSize));
                const to = Math.max(0, Math.min(newEnd, docSize));

                if (from < to) {
                  ranges.push({ from, to });
                }
              });
            });
          });

          const mergedRanges = ranges
            .sort((a, b) => a.from - b.from)
            .reduce((acc, curr) => {
              const last = acc[acc.length - 1];
              if (!last) return [curr];

              if (curr.from <= last.to) {
                last.to = Math.max(last.to, curr.to);
              } else {
                acc.push(curr);
              }

              return acc;
            }, [] as { from: number; to: number }[]);

          if (mergedRanges.length === 0) return null;

          mergedRanges.forEach((range) => {
            newState.doc.nodesBetween(range.from, range.to, (node, pos, parent) => {
              if (!parent) return true;

              const parentRole = Governance.resolveRole(parent);
              const childRole = Governance.resolveRole(node);
              const allowedMask = (parent.type.spec as any).allowedRoles;

              if (!Governance.canAccept(parentRole, childRole, allowedMask)) {
                const action = Governance.resolveHealingAction(parentRole, childRole);
                if (action !== HealingAction.NONE) {
                  const key = `${pos}:${action}:${node.type.name}`;
                  if (!seenViolations.has(key)) {
                    seenViolations.add(key);
                    violations.push({ pos, action, typeName: node.type.name });
                  }
                }
              }
              return true;
            });
          });

          if (violations.length === 0) return null;

          // 4. Resolve Violations in REVERSE order to avoid position shifting
          let docChanged = false;
          violations
            .sort((a, b) => b.pos - a.pos)
            .forEach(({ pos, action, typeName }) => {
              try {
                // Safety: Re-resolve against the LATEST document state during the loop
                const currentDocSize = tr.doc.content.size;
                if (pos < 0 || pos >= currentDocSize) return;

                const currentNode = tr.doc.nodeAt(pos);
                if (!currentNode || currentNode.type.name !== typeName) return;

                const from = tr.doc.resolve(pos);
                const to = tr.doc.resolve(Math.min(pos + currentNode.nodeSize, currentDocSize));

                if (action === HealingAction.LIFT) {
                  const range = from.blockRange(to);
                  if (range) {
                    const stepCountBefore = tr.steps.length;
                    tr.lift(range, Math.max(0, range.depth - 1));
                    docChanged = docChanged || tr.steps.length > stepCountBefore;
                  }
                } else if (action === HealingAction.WRAP) {
                  const range = from.blockRange(to);
                  const paragraph = newState.schema.nodes.paragraph;
                  if (range && paragraph) {
                    const stepCountBefore = tr.steps.length;
                    tr.wrap(range, [{ type: paragraph }]);
                    docChanged = docChanged || tr.steps.length > stepCountBefore;
                  }
                } else if (action === HealingAction.DELETE) {
                  const size = currentNode.nodeSize;
                  if (size > 0) {
                    const stepCountBefore = tr.steps.length;
                    tr.delete(pos, Math.min(pos + size, tr.doc.content.size));
                    docChanged = docChanged || tr.steps.length > stepCountBefore;
                  }
                }
              } catch (e) {
                console.error("[Arkpad Governance] Individual healing action failed:", e);
              }
            });

          let selectionChanged = false;
          if (docChanged && newState.selection) {
            const mappedSelection = newState.selection.map(tr.doc, tr.mapping);
            const finalSize = tr.doc.content.size;
            const safeFrom = Math.max(0, Math.min(mappedSelection.from, finalSize));
            const safeTo = Math.max(0, Math.min(mappedSelection.to, finalSize));

            if (mappedSelection instanceof NodeSelection) {
              const nodeAtPos = tr.doc.nodeAt(safeFrom);
              const nextSelection =
                nodeAtPos && nodeAtPos.type.spec.selectable !== false
                  ? NodeSelection.create(tr.doc, safeFrom)
                  : TextSelection.create(tr.doc, safeFrom);

              if (!nextSelection.eq(tr.selection)) {
                tr.setSelection(nextSelection);
                selectionChanged = true;
              }
            } else {
              const nextSelection = TextSelection.create(tr.doc, safeFrom, safeTo);
              if (!nextSelection.eq(tr.selection)) {
                tr.setSelection(nextSelection);
                selectionChanged = true;
              }
            }
          }

          if (!docChanged && !selectionChanged) return null;

          tr.setMeta("governance-healing", true);
          return tr;
        },
      })
    );

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
    this.selectionHooks = [];
    this.updateHooks = [];
    this.extensionManager.extensions.forEach((ext) => {
      if (ext.onTransaction) this.transactionHooks.push(ext);
      if (ext.onSelection) this.selectionHooks.push(ext);
      if (ext.onUpdate) this.updateHooks.push(ext);
    });

    this.emitUpdate(nextState);

    return nextState;
  }

  private emitUpdate(state: EditorState) {
    if (this.isBatching) return;

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

    // Strict Mode: Command Guard
    if (!this.isCommandAllowed(name)) {
      console.warn(`[Arkpad Governance] Command "${name}" blocked by structural rules.`);
      return false;
    }

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
      const cmdResult = result(props);
      // If the command returned a chain, run it.
      if (
        cmdResult &&
        typeof cmdResult === "object" &&
        "run" in cmdResult &&
        typeof (cmdResult as any).run === "function"
      ) {
        return (cmdResult as any).run();
      }
      return cmdResult;
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
          chain: () => this.can(),
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
      editor: this,
      // Use the REAL dispatch. CommandManager should dispatch the master transaction directly.
      dispatch: (tr: Transaction) => {
        if (tr.steps.length > 0 || tr.selectionSet) {
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
      editor: this,
      shouldDispatch: false,
      schema: this.extensionManager.schema,
    }) as unknown as ChainedCommands;
  }

  /**
   * Selection API
   */
  getSelection() {
    const { selection } = this.view.state;
    const { from, to, empty } = selection;

    // Detect Table Cell Selection (Duck Typing to avoid direct dependency in core)
    const cellSelection = selection as any;
    if (cellSelection.anchorCell && cellSelection.headCell) {
      return {
        from,
        to,
        empty: false,
        isCellSelection: true,
        anchorCell: cellSelection.anchorCell,
        headCell: cellSelection.headCell,
        ranges: cellSelection.ranges,
      };
    }

    return { from, to, empty, isCellSelection: false };
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
    const { selection } = state;
    const docSize = state.doc.content.size;

    // Handle Table Cell Selection coordinates
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
      } catch (e) {
        console.warn("Arkpad: Failed to get cell selection coordinates", e);
      }
    }

    const position = pos ?? selection.from;

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
  setContent(content: ArkpadContent, emitUpdate = true) {
    const { schema } = this.extensionManager;
    const parsedDoc = parseContent(content, schema);
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
    this.setContent("<p></p>", emitUpdate);
  }

  /**
   * Focuses the editor.
   */
  focus(pos?: "start" | "end" | number) {
    if (this.view.hasFocus() && pos === undefined) return;

    this.view.focus();
    this.events.emit("focus", { editor: this });

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
    this.events.emit("blur", { editor: this });
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
   * Saves a snapshot of the current editor state.
   */
  saveSnapshot(name: string) {
    this.snapshots[name] = this.view.state;
  }

  /**
   * Restores a saved snapshot of the editor state.
   */
  restoreSnapshot(name: string): boolean {
    const state = this.snapshots[name];
    if (!state) {
      console.warn(`[Arkpad] Snapshot "${name}" not found.`);
      return false;
    }

    this.view.updateState(state);
    this.emitUpdate(state);
    return true;
  }

  /**
   * Sets a virtual selection (Ghost Cursor) for an external entity (e.g., an AI Agent).
   */
  setVirtualSelection(
    id: string,
    options: { from: number; to: number; color: string; label?: string }
  ) {
    this.virtualSelections.set(id, options);
    // Dispatch a meta-only transaction to refresh decorations without causing infinite loops
    const tr = this.view.state.tr;
    tr.setMeta("virtual-selection-update", id);
    this.view.dispatch(tr);
  }

  /**
   * Removes a virtual selection.
   */
  removeVirtualSelection(id: string) {
    this.virtualSelections.delete(id);
    const tr = this.view.state.tr;
    tr.setMeta("virtual-selection-update", id);
    this.view.dispatch(tr);
  }

  /**
   * Registers an async interceptor (Agentic Middleware).
   */
  addAsyncInterceptor(interceptor: AsyncInterceptor) {
    this.asyncInterceptors.push(interceptor);
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
  subscribe(callback: (editor: IArkpadEditor) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Manually notifies all subscribers that the editor state has changed.
   */
  refresh() {
    this.emitUpdate(this.view.state);
  }

  /**
   * Returns the current structural governance rules for the editor.
   * Useful for AI Agents or dynamic UI components.
   */
  getGovernanceRules() {
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

  /**
   * Internal helper to check if a command is allowed at the current selection.
   */
  private isCommandAllowed(name: string): boolean {
    const { state } = this.view;
    const { $from } = state.selection;
    const parent = $from.parent;

    // 0. Resolve the extension that provides this command
    const ext = this.extensionManager.commandToExtension.get(name);

    // 1. If it's a Mark extension command (Bold, Italic, etc.), always allow by node governance
    // We check the extension's config or name for 'mark' status
    if (state.schema.marks[name] || (ext && (ext as any).config?.addMarks)) {
      return true;
    }

    // 2. Resolve what this command intends to create
    let targetRole = NodeRole.CONTENT; // Default

    if (ext && ext.role !== undefined) {
      targetRole = ext.role;
    } else {
      // Fallback: Smart heuristic if extension doesn't declare a role
      if (name.toLowerCase().includes("heading")) targetRole = NodeRole.CONTENT;
      if (name.toLowerCase().includes("list")) targetRole = NodeRole.LAYOUT;
      if (name.toLowerCase().includes("image") || name.toLowerCase().includes("table"))
        targetRole = NodeRole.WIDGET;
    }

    const parentRole = Governance.resolveRole(parent);
    const allowedMask = (parent.type.spec as any).allowedRoles;

    return Governance.canAccept(parentRole, targetRole, allowedMask);
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
          editor: IArkpadEditor;
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
   * Batches multiple editor updates into a single re-render cycle.
   */
  batch(callback: (editor: IArkpadEditor) => void) {
    this.isBatching = true;
    try {
      callback(this);
    } finally {
      this.isBatching = false;
      this.emitUpdate(this.view.state);
    }
  }

  /**
   * Destroys the editor instance.
   */
  destroy() {
    this.extensionManager.extensions.forEach((ext) => {
      ext.onDestroy?.();
    });
    this.extensionManager.destroy();
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

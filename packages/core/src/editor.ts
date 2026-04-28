import { DOMSerializer } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { arkpadSchema } from "./schema";
import {
  ExtensionManager,
  createDefaultExtensions,
  type Extension,
  type Dispatch,
  isMarkActive,
  isNodeActive,
  getMarkAttributes,
  getNodeAttributes,
} from "./extensions";
import { defaultMarkdownSerializer } from "./extensions/markdown/serializer";
import type {
  ArkpadCommandRegistry,
  ArkpadContent,
  ArkpadDocJSON,
  ArkpadEditorAPI,
  ArkpadEditorOptions,
} from "./types";
import { parseContent, resolveEditorOptions } from "./utils";

/**
 * The core editor class for Arkpad.
 * Handles the ProseMirror view, state, and command execution.
 */
export class ArkpadEditor implements ArkpadEditorAPI {
  public readonly element: HTMLElement;
  public commands: ArkpadCommandRegistry;
  public extensionManager: ExtensionManager;

  private readonly onCreate?: ArkpadEditorOptions["onCreate"];
  private readonly onUpdate?: ArkpadEditorOptions["onUpdate"];
  private readonly onDestroy?: ArkpadEditorOptions["onDestroy"];
  private readonly nodeViews: Record<string, any>;
  private readonly serializer: DOMSerializer;

  private editable: boolean;
  private view: EditorView;
  private destroyed = false;

  constructor(options: ArkpadEditorOptions) {
    const resolved = resolveEditorOptions(options);

    this.element = resolved.element;
    this.editable = resolved.editable;
    this.onCreate = resolved.onCreate;
    this.onUpdate = resolved.onUpdate;
    this.onDestroy = resolved.onDestroy;
    this.nodeViews = resolved.nodeViews;
    this.serializer = DOMSerializer.fromSchema(arkpadSchema);

    const extensionManager = new ExtensionManager(arkpadSchema, [
      ...createDefaultExtensions(),
      ...resolved.extensions,
    ]);

    this.extensionManager = extensionManager;
    this.commands = extensionManager.commands as unknown as ArkpadCommandRegistry;

    const state = this.createState(resolved.content);

    this.view = new EditorView(this.element, {
      state,
      editable: () => this.editable,
      nodeViews: this.nodeViews,
      dispatchTransaction: (transaction) => {
        const nextState = this.view.state.apply(transaction);
        this.view.updateState(nextState);
        this.emitUpdate(nextState);
      },
    });

    this.onCreate?.(this);

    if (resolved.autofocus) {
      this.focus();
    }
  }

  private createState(content: ArkpadContent) {
    const parsedDoc = parseContent(content, arkpadSchema);
    const plugins = this.extensionManager.getPlugins();

    return EditorState.create({
      schema: arkpadSchema,
      doc: parsedDoc,
      plugins,
    });
  }

  private refreshState(content: ArkpadContent = this.view.state.doc.toJSON()) {
    const nextState = EditorState.create({
      schema: arkpadSchema,
      doc: parseContent(content, arkpadSchema),
      plugins: this.extensionManager.getPlugins(),
    });
    this.view.updateState(nextState);
    return nextState;
  }

  private emitUpdate(state: EditorState) {
    this.onUpdate?.({
      editor: this,
      state,
      html: this.getHTML(),
      json: this.getJSON(),
      text: this.getText(),
    });
  }

  /**
   * Returns the current editor state.
   */
  getState() {
    return this.view.state;
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
   * Checks if a command can be executed.
   */
  canRunCommand(name: string): boolean {
    const command = this.commands[name];
    if (!command) return false;
    return (command as (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean)(
      this.view.state,
      undefined,
      this.view
    );
  }

  /**
   * Checks if a specific mark or node is active at the current selection.
   */
  isActive(name: string, attrs: Record<string, any> = {}): boolean {
    const { state } = this.view;

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
    const parsedDoc = parseContent(content, arkpadSchema, format);
    const state = this.view.state;
    const nextState = EditorState.create({
      schema: arkpadSchema,
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
  focus() {
    this.view.focus();
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
    this.commands = this.extensionManager.commands as unknown as ArkpadCommandRegistry;
    this.refreshState(this.view.state.doc.toJSON());
  }

  /**
   * Registers multiple extensions.
   */
  registerExtensions(extensions: Extension[]) {
    this.extensionManager.registerExtensions(extensions);
    this.commands = this.extensionManager.commands as unknown as ArkpadCommandRegistry;
    this.refreshState(this.view.state.doc.toJSON());
  }

  /**
   * Destroys the editor instance.
   */
  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
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

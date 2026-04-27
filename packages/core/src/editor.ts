import {
  DOMParser as PMDOMParser,
  DOMSerializer,
  Node as PMNode,
  type Schema,
} from "prosemirror-model";
import { EditorState, type Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { arkpadSchema } from "./schema";
import {
  ExtensionManager,
  createDefaultExtensions,
  type Extension,
  type Dispatch,
} from "./extensions";
import { markdownToHtml } from "./extensions/markdown/parser";
import { defaultMarkdownSerializer } from "./extensions/markdown/serializer";
import type {
  ArkpadCommandRegistry,
  ArkpadContent,
  ArkpadDocJSON,
  ArkpadEditorAPI,
  ArkpadEditorOptions,
} from "./types";

function parseHtmlContent(content: string, schema: Schema) {
  const parser = PMDOMParser.fromSchema(schema);
  const element = document.createElement("div");
  element.innerHTML = content.trim().length > 0 ? content : "<p></p>";
  return parser.parse(element);
}

function parseContent(
  content: ArkpadContent,
  schema: Schema,
  format?: "html" | "markdown" | "json"
) {
  if (typeof content === "string") {
    if (format === "markdown" || /^[#*_\-+>=\s]|^\d+\. /m.test(content)) {
      return parseHtmlContent(markdownToHtml(content), schema);
    }
    return parseHtmlContent(content, schema);
  }
  return PMNode.fromJSON(schema, content);
}

function resolveEditorOptions(options: ArkpadEditorOptions) {
  return {
    element: options.element,
    content: options.content ?? "<p></p>",
    editable: options.editable ?? true,
    extensions: options.extensions ?? [],
    nodeViews: options.nodeViews ?? {},
    autofocus: options.autofocus ?? false,
    onCreate: options.onCreate,
    onUpdate: options.onUpdate,
    onDestroy: options.onDestroy,
  };
}

export class ArkpadEditor implements ArkpadEditorAPI {
  public readonly element: HTMLElement;
  public commands: ArkpadCommandRegistry;
  public extensionManager: ExtensionManager;

  private readonly onCreate?: ArkpadEditorOptions["onCreate"];
  private readonly onUpdate?: ArkpadEditorOptions["onUpdate"];
  private readonly onDestroy?: ArkpadEditorOptions["onDestroy"];
  private readonly nodeViews: Record<string, any>;

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

  getState() {
    return this.view.state;
  }

  getHTML(): string {
    const serializer = DOMSerializer.fromSchema(arkpadSchema);
    const fragment = serializer.serializeFragment(this.view.state.doc.content);
    const container = document.createElement("div");
    container.appendChild(fragment);
    return container.innerHTML;
  }

  getJSON(): ArkpadDocJSON {
    return this.view.state.doc.toJSON();
  }

  getText(): string {
    return this.view.state.doc.textBetween(0, this.view.state.doc.content.size, "\n\n");
  }

  getMarkdown(): string {
    return defaultMarkdownSerializer.serialize(this.view.state.doc);
  }

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

  canRunCommand(name: string): boolean {
    const command = this.commands[name];
    if (!command) return false;
    return (command as (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean)(
      this.view.state,
      undefined,
      this.view
    );
  }

  isActive(name: string, attrs: Record<string, any> = {}): boolean {
    const { state } = this.view;
    const { from, to, empty, $from } = state.selection;

    // Check for Marks (bold, italic, etc.)
    const markType = state.schema.marks[name];
    if (markType) {
      if (empty) {
        return !!markType.isInSet(state.storedMarks || $from.marks());
      }
      return state.doc.rangeHasMark(from, to, markType);
    }

    // Check for Nodes (heading, blockquote, etc.)
    const nodeType = state.schema.nodes[name];
    if (nodeType) {
      // PRO-GRADE DEPTH CHECK: Look up the parent tree of the selection
      for (let depth = $from.depth; depth >= 0; depth--) {
        const node = $from.node(depth);
        if (node.type === nodeType) {
          const hasMatchingAttrs = Object.entries(attrs).every(
            ([key, value]) => node.attrs[key] === value
          );
          if (hasMatchingAttrs) {
            return true;
          }
        }
      }

      // Fallback: If it's a range selection, check if the range contains the node type
      if (!empty) {
        let foundInRange = false;
        state.doc.nodesBetween(from, to, (node) => {
          if (foundInRange) return false;
          if (node.type === nodeType) {
            const hasMatchingAttrs = Object.entries(attrs).every(
              ([key, value]) => node.attrs[key] === value
            );
            if (hasMatchingAttrs) {
              foundInRange = true;
            }
          }
        });
        return foundInRange;
      }
    }

    return false;
  }

  getAttributes(name: string): Record<string, any> | null {
    const { state } = this.view;
    const { from, to, $from, empty } = state.selection;

    if (arkpadSchema.marks[name]) {
      const markType = arkpadSchema.marks[name];
      const marks = empty ? $from.marks() || state.storedMarks : [];

      if (empty && marks) {
        const mark = marks.find((m) => m.type === markType);
        return mark ? mark.attrs : null;
      }

      let attrs: Record<string, any> | null = null;
      state.doc.nodesBetween(from, to, (node) => {
        const mark = node.marks.find((m) => m.type === markType);
        if (mark) attrs = mark.attrs;
      });
      return attrs;
    }

    if (arkpadSchema.nodes[name]) {
      const nodeType = arkpadSchema.nodes[name];
      let attrs: Record<string, any> | null = null;

      state.doc.nodesBetween(from, to, (node) => {
        if (node.type === nodeType) {
          attrs = node.attrs;
        }
      });

      if (!attrs && empty && $from.parent.type === nodeType) {
        attrs = $from.parent.attrs;
      }

      return attrs;
    }

    return null;
  }

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

  clearContent(emitUpdate = true) {
    this.setContent("<p></p>", undefined, emitUpdate);
  }

  focus() {
    this.view.focus();
  }

  blur() {
    this.view.dom.blur();
  }

  setEditable(editable: boolean) {
    this.editable = editable;
    this.view.setProps({ editable: () => this.editable });
  }

  isEditable() {
    return this.editable;
  }

  registerExtension(extension: Extension) {
    this.extensionManager.registerExtension(extension);
    this.commands = this.extensionManager.commands as unknown as ArkpadCommandRegistry;
    this.refreshState(this.view.state.doc.toJSON());
  }

  registerExtensions(extensions: Extension[]) {
    this.extensionManager.registerExtensions(extensions);
    this.commands = this.extensionManager.commands as unknown as ArkpadCommandRegistry;
    this.refreshState(this.view.state.doc.toJSON());
  }

  destroy() {
    if (this.destroyed) return;

    this.destroyed = true;
    this.view.destroy();
    this.onDestroy?.(this);
  }
}

export function createArkpadEditor(options: ArkpadEditorOptions) {
  return new ArkpadEditor(options);
}

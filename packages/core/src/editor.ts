import { DOMParser as PMDOMParser, DOMSerializer, Node as PMNode, type Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { arkpadSchema } from "./schema";
import { ExtensionManager, createDefaultExtensions, type Extension, type Dispatch } from "./extensions";
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

function parseContent(content: ArkpadContent, schema: Schema) {
  if (typeof content === "string") {
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
      dispatchTransaction: (transaction) => {
        const nextState = this.view.state.apply(transaction);
        this.view.updateState(nextState);

        if (transaction.docChanged) {
          this.emitUpdate(nextState);
        }
      },
    });

    this.onCreate?.(this);

    if (resolved.autofocus) {
      this.focus();
    }
  }

  private createState(content: ArkpadContent) {
    return EditorState.create({
      schema: arkpadSchema,
      doc: parseContent(content, arkpadSchema),
      plugins: [
        ...this.extensionManager.inputRules,
        ...this.extensionManager.proseMirrorPlugins,
      ],
    });
  }

  private refreshState(content: ArkpadContent = this.view.state.doc.toJSON()) {
    const nextState = this.createState(content);
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
    return this.view.state.doc.textBetween(
      0,
      this.view.state.doc.content.size,
      "\n\n"
    );
  }

  runCommand(name: string): boolean {
    if (this.destroyed) return false;

    const command = this.commands[name];
    if (!command) return false;

    return (command as (state: EditorState, dispatch?: Dispatch, view?: EditorView) => boolean)(
      this.view.state,
      this.view.dispatch,
      this.view
    );
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

  setContent(content: ArkpadContent, emitUpdate = true) {
    const nextState = this.refreshState(content);
    if (emitUpdate) {
      this.emitUpdate(nextState);
    }
  }

  clearContent(emitUpdate = true) {
    this.setContent("<p></p>", emitUpdate);
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
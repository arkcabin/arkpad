import { DOMParser as PMDOMParser, DOMSerializer, Node as PMNode } from "prosemirror-model";
import { EditorState, type Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";

import { createDefaultCommands, createDefaultPlugins } from "./defaults";
import { arkpadSchema } from "./schema";
import type {
  ArkpadCommandRegistry,
  ArkpadContent,
  ArkpadEditorAPI,
  ArkpadEditorOptions,
  ArkpadExtension,
  ResolvedArkpadEditorOptions,
} from "./types";

function parseHtmlContent(content: string) {
  const parser = PMDOMParser.fromSchema(arkpadSchema);
  const element = document.createElement("div");
  element.innerHTML = content.trim().length > 0 ? content : "<p></p>";
  return parser.parse(element);
}

function parseContent(content: ArkpadContent) {
  if (typeof content === "string") {
    return parseHtmlContent(content);
  }

  return PMNode.fromJSON(arkpadSchema, content);
}

function resolveEditorOptions(
  options: ArkpadEditorOptions,
): ResolvedArkpadEditorOptions {
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
  private readonly onCreate?: ArkpadEditorOptions["onCreate"];
  private readonly onUpdate?: ArkpadEditorOptions["onUpdate"];
  private readonly onDestroy?: ArkpadEditorOptions["onDestroy"];
  private extensions: ArkpadExtension[];
  private editable: boolean;
  private view: EditorView;
  private destroyed = false;

  constructor(options: ArkpadEditorOptions) {
    const resolved = resolveEditorOptions(options);

    this.element = resolved.element;
    this.extensions = [...resolved.extensions];
    this.editable = resolved.editable;
    this.onCreate = resolved.onCreate;
    this.onUpdate = resolved.onUpdate;
    this.onDestroy = resolved.onDestroy;
    this.commands = this.collectCommands(this.extensions);

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

  private collectCommands(extensions: ArkpadExtension[]) {
    return {
      ...createDefaultCommands(),
      ...Object.assign({}, ...extensions.map((extension) => extension.commands ?? {})),
    };
  }

  private collectPlugins(extensions: ArkpadExtension[]): Plugin[] {
    return [
      ...createDefaultPlugins(),
      ...extensions.flatMap((extension) => extension.plugins ?? []),
    ];
  }

  private createState(content: ArkpadContent) {
    return EditorState.create({
      schema: arkpadSchema,
      doc: parseContent(content),
      plugins: this.collectPlugins(this.extensions),
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

  getHTML() {
    const serializer = DOMSerializer.fromSchema(arkpadSchema);
    const fragment = serializer.serializeFragment(this.view.state.doc.content);
    const container = document.createElement("div");
    container.appendChild(fragment);
    return container.innerHTML;
  }

  getJSON() {
    return this.view.state.doc.toJSON();
  }

  getText() {
    return this.view.state.doc.textBetween(0, this.view.state.doc.content.size, "\n\n");
  }

  runCommand(name: string): boolean {
    if (this.destroyed) {
      return false;
    }

    const command = this.commands[name];
    if (!command) {
      return false;
    }

    return command(this.view.state, this.view.dispatch, this.view);
  }

  canRunCommand(name: string): boolean {
    const command = this.commands[name];
    return command ? command(this.view.state, undefined, this.view) : false;
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

  registerExtension(extension: ArkpadExtension) {
    this.extensions = [...this.extensions, extension];
    this.commands = this.collectCommands(this.extensions);
    this.refreshState(this.view.state.doc.toJSON());
  }

  registerExtensions(extensions: ArkpadExtension[]) {
    this.extensions = [...this.extensions, ...extensions];
    this.commands = this.collectCommands(this.extensions);
    this.refreshState(this.view.state.doc.toJSON());
  }

  destroy() {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    this.view.destroy();
    this.onDestroy?.(this);
  }
}

export function createArkpadEditor(options: ArkpadEditorOptions) {
  return new ArkpadEditor(options);
}

import { EditorState, Plugin } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { IArkpadEditor, ArkpadContent } from "../api";
import { parseContent } from "../utils";
import { PluginFactory } from "./PluginFactory";
import { HookManager } from "./HookManager";

export class StateManager {
  public snapshots: Record<string, EditorState> = {};

  constructor(
    private editor: IArkpadEditor,
    private hooks: HookManager
  ) {}

  public createState(
    content: ArkpadContent,
    schema: Schema,
    extensionsPlugins: Plugin[],
    virtualSelections: Map<string, any>
  ) {
    const parsedDoc = parseContent(content, schema);
    const plugins = [...extensionsPlugins];

    // Core Plugins
    plugins.push(PluginFactory.createEventInterceptorPlugin(this.editor, this.hooks));
    plugins.push(PluginFactory.createGhostSelectionPlugin(virtualSelections));
    plugins.push(PluginFactory.createStructuralHealerPlugin());

    plugins.push(PluginFactory.createPaintingDeactivationPlugin());

    return EditorState.create({ schema, doc: parsedDoc, plugins });
  }

  public refreshState(content: ArkpadContent, schema: Schema, plugins: readonly Plugin[]) {
    const view = this.editor.getView();
    if (!view || (view as any).isDestroyed) return;

    const nextState = EditorState.create({
      schema,
      doc: parseContent(content, schema),
      plugins: [...plugins],
    });
    view.updateState(nextState);
    this.editor.emitUpdate(nextState);
    return nextState;
  }

  public saveSnapshot(name: string, state: EditorState) {
    this.snapshots[name] = state;
  }

  public restoreSnapshot(name: string): EditorState | null {
    return this.snapshots[name] || null;
  }
}

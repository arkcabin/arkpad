import { DOMSerializer } from "prosemirror-model";
import { IArkpadEditor, ArkpadDocJSON, ArkpadContent } from "../../api";

/**
 * ContentService handles the serialization and deserialization of document content,
 * supporting HTML, JSON, Plain Text, and Markdown (via extensions).
 */
export class ContentService {
  private serializer: DOMSerializer;

  constructor(private editor: IArkpadEditor) {
    this.serializer = DOMSerializer.fromSchema(this.editor.extensionManager.schema);
  }

  /**
   * Re-initializes the serializer if the schema changes (e.g. during extension registration).
   */
  public refreshSerializer() {
    this.serializer = DOMSerializer.fromSchema(this.editor.extensionManager.schema);
  }

  public getHTML(): string {
    const { doc } = this.editor.getState();
    const fragment = this.serializer.serializeFragment(doc.content);

    if (typeof document === "undefined") {
      return "";
    }

    const container = document.createElement("div");
    container.appendChild(fragment);
    return container.innerHTML;
  }

  public getJSON(): ArkpadDocJSON {
    return this.editor.getState().doc.toJSON();
  }

  public getText(): string {
    const { doc } = this.editor.getState();
    return doc.textBetween(0, doc.content.size, "\n\n");
  }

  public getMarkdown(): string {
    const extensionManager = this.editor.extensionManager;
    const markdownExtension = extensionManager.extensions.find((e: any) => e.name === "markdown");
    if (markdownExtension && (markdownExtension as any).serializer) {
      return (markdownExtension as any).serializer.serialize(this.editor.getState().doc);
    }
    return this.getText();
  }

  public setContent(content: ArkpadContent, emitUpdate = true) {
    // Note: stateManager handles the core refresh, we just orchestrate
    this.editor.stateManager.refreshState(
      content,
      this.editor.extensionManager.schema,
      this.editor.getState().plugins
    );

    if (emitUpdate) {
      this.editor.emitUpdate(this.editor.getState());
    }
  }

  public clearContent(emitUpdate = true) {
    this.setContent("<p></p>", emitUpdate);
  }
}

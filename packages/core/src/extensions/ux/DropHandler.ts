import { Extension } from "../../sdk/Extension";

/**
 * DropHandler - Handles external drag-and-drop events from the Block Library.
 * It parses the 'application/arkpad-block' data and inserts the corresponding node.
 */
export const DropHandler = Extension.create({
  name: "dropHandler",

  onDrop(event: DragEvent, slice: any, moved: boolean) {
    const { view } = this.editor;
    if (!view) return false;

    // 1. Check for our custom block data
    const data = event.dataTransfer?.getData("application/arkpad-block");
    if (!data) return false;

    try {
      const blockData = JSON.parse(data);
      const coords = { left: event.clientX, top: event.clientY };
      const posResult = view.posAtCoords(coords);
      
      // If dropped below the last element, posResult might be null or return the end of doc
      let targetPos = posResult ? posResult.pos : view.state.doc.content.size;

      event.preventDefault();

      // 2. Resolve the node type and create it safely
      const nodeType = view.state.schema.nodes[blockData.type];
      if (!nodeType) return false;

      // 3. Ensure containers have at least one child if empty
      // This prevents "invisible" sections that can't be clicked into.
      let content = blockData.content;
      if (nodeType.spec.content && (!content || content.length === 0)) {
        const p = view.state.schema.nodes.paragraph;
        if (p) {
          content = [{ type: "paragraph" }];
        }
      }

      // 4. Insert the content at the dropped position
      this.editor.chain()
        .insertContentAt(targetPos, {
          type: blockData.type,
          attrs: blockData.attrs,
          content: content,
        })
        .focus()
        .run();

      return true;
    } catch (e) {
      console.error("[Arkpad] Failed to parse or handle drop data:", e);
    }

    return false;
  },
});

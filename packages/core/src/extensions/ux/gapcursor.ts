import { gapCursor } from "prosemirror-gapcursor";
import { Extension } from "../../sdk/Extension";

/**
 * Gapcursor extension - Cursor outside blocks (tables, code blocks).
 */
export const Gapcursor = Extension.create({
  name: "gapcursor",
  
  addProseMirrorPlugins() {
    return [gapCursor()];
  },
});

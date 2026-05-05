import { dropCursor } from "prosemirror-dropcursor";
import { Extension } from "./Extension";

/**
 * Dropcursor extension - Visual drop indicator when dragging content.
 */
export type DropcursorOptions = {
  width?: number;
  color?: string;
  class?: string;
};

export const Dropcursor = Extension.create<DropcursorOptions>({
  name: "dropcursor",
  
  addOptions() {
    return {
      width: 1,
      color: "currentColor",
      class: undefined,
    };
  },
  
  addProseMirrorPlugins() {
    return [
      dropCursor({
        width: this.options.width,
        color: this.options.color,
        class: this.options.class,
      }),
    ];
  },
});

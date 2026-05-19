import { dropCursor } from "prosemirror-dropcursor";
import { Extension } from "../../sdk/Extension";

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
      width: 2,
      color: "#000",
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

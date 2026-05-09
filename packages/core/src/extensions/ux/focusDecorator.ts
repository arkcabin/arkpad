import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Extension } from "../../sdk/Extension";

/**
 * FocusDecorator - Adds a 'has-focus' class to the node that currently contains the selection.
 */
export const FocusDecorator = Extension.create({
  name: "focusDecorator",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("focusDecorator"),
        props: {
          decorations: (state) => {
            const { selection } = state;
            const { $from } = selection;
            const decorations: Decoration[] = [];

            // Find the top-level block node containing the selection
            // We want to highlight the "Block" (Section, Column, or Paragraph)
            let depth = $from.depth;
            let node = $from.node(depth);

            // We only want to decorate block nodes
            while (depth > 0 && node.type.isInline) {
              depth--;
              node = $from.node(depth);
            }

            if (depth > 0 && node && node.type.isBlock) {
              const pos = $from.before(depth);
              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: "has-focus",
                })
              );
            }

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

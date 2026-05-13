import { Extension, Decoration, DecorationSet } from "@arkpad/core";
import { Plugin } from "prosemirror-state";

export type PlaceholderText = string | ((props: { node: any; pos: number; editor: any }) => string);

export interface PlaceholderOptions {
  emptyEditorClass?: string;
  emptyNodeClass?: string;
  placeholder: PlaceholderText;
  showOnlyWhenEditable?: boolean;
  showOnlyCurrent?: boolean;
  includeChildren?: boolean;
}

function makeWidget(text: string, className: string) {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

export const Placeholder = Extension.create<PlaceholderOptions>({
  name: "placeholder",

  addOptions() {
    return {
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-empty",
      placeholder: "Start writing...",
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
    };
  },

  addProseMirrorPlugins() {
    const opts = this.options;
    const editor = this.editor;

    return [
      new Plugin({
        props: {
          decorations(state: any) {
            if (opts.showOnlyWhenEditable && editor && !editor.isEditable()) {
              return DecorationSet.empty;
            }

            const { doc, selection } = state;
            const from = selection.from;

            if (doc.textContent.length === 0) {
              const text =
                typeof opts.placeholder === "function"
                  ? opts.placeholder({ node: doc, pos: 0, editor })
                  : opts.placeholder;
              const deco = Decoration.widget(1, () => makeWidget(text, "ark-placeholder"));
              return DecorationSet.create(doc, [deco]);
            }

            const decorations: Decoration[] = [];

            doc.descendants((node: any, pos: number) => {
              if (!node.isBlock) {
                if (opts.includeChildren) return true;
                return false;
              }
              if (node.content.size > 0) return false;
              if (opts.showOnlyCurrent && pos + node.nodeSize <= from) return false;

              const text =
                typeof opts.placeholder === "function"
                  ? opts.placeholder({ node, pos, editor })
                  : opts.placeholder;
              const deco = Decoration.widget(pos + 1, () => makeWidget(text, "ark-placeholder"));
              decorations.push(deco);
              return false;
            });

            return decorations.length > 0
              ? DecorationSet.create(doc, decorations)
              : DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

export default Placeholder;

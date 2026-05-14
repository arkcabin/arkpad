import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Extension } from "../../sdk/Extension";

export type PlaceholderText = string | ((props: { node: any; pos: number; editor: any }) => string);

export interface PlaceholderOptions {
  emptyEditorClass: string;
  emptyNodeClass: string;
  placeholder: PlaceholderText;
  showOnlyWhenEditable: boolean;
  showOnlyCurrent: boolean;
  includeChildren: boolean;
  showOnlyWhenFocused: boolean;
  types: Record<string, PlaceholderText>;
}

function makeWidget(text: string, className: string) {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

function resolvePlaceholder(
  placeholder: PlaceholderOptions["placeholder"],
  types: PlaceholderOptions["types"],
  node: any,
  pos: number,
  editor: any
): string {
  if (types && types[node.type.name]) {
    const tp = types[node.type.name];
    return typeof tp === "function" ? tp({ node, pos, editor }) : String(tp);
  }
  if (typeof placeholder === "function") {
    return placeholder({ node, pos, editor });
  }
  return String(placeholder);
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
      showOnlyWhenFocused: false,
      types: {},
    };
  },

  addProseMirrorPlugins() {
    const opts = this.options;
    const editor = this.editor;

    return [
      new Plugin({
        props: {
          decorations(state: any) {
            const { doc, selection } = state;
            const { $from } = selection;
            const from = $from.pos;

            if (opts.showOnlyWhenEditable && editor && !editor.isEditable()) {
              return DecorationSet.empty;
            }

            if (opts.showOnlyWhenFocused && editor && !editor.isFocused()) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];

            if (doc.content.size === 0) {
              const text = resolvePlaceholder(opts.placeholder, opts.types, doc, 0, editor);
              if (text) {
                decorations.push(Decoration.widget(1, () => makeWidget(text, "ark-placeholder")));
              }
              return DecorationSet.create(doc, decorations);
            }

            doc.descendants((node: any, pos: number) => {
              if (!node.isBlock) {
                if (opts.includeChildren) return true;
                return false;
              }

              if (node.content.size > 0) {
                return opts.includeChildren;
              }

              if (opts.showOnlyCurrent && pos + node.nodeSize <= from) return false;

              const text = resolvePlaceholder(opts.placeholder, opts.types, node, pos, editor);
              if (!text) return false;

              decorations.push(
                Decoration.widget(pos + 1, () => makeWidget(text, "ark-placeholder"))
              );

              if (opts.emptyNodeClass) {
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: opts.emptyNodeClass,
                  })
                );
              }

              return false;
            });

            return decorations.length > 0
              ? DecorationSet.create(doc, decorations)
              : DecorationSet.empty;
          },
        },

        view(view: any) {
          return {
            update: () => {
              if (opts.emptyEditorClass) {
                view.dom.classList.toggle(opts.emptyEditorClass, view.state.doc.content.size === 0);
              }
            },
          };
        },
      }),
    ];
  },
});

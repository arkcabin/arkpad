import { Plugin } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import { Extension } from "../../sdk/Extension";

export interface GhostTextStorage {
  text: string;
  pos: number;
}

/**
 * GhostText extension provides a non-intrusive way to render AI suggestions
 * and "materialize" them into the document via a single keypress (Tab).
 */
export const GhostText = Extension.create<any, GhostTextStorage>({
  name: "ghostText",

  addStorage() {
    return {
      text: "",
      pos: -1,
    };
  },

  addCommands() {
    return {
      /**
       * Sets the ghost text suggestion at a specific position.
       */
      setGhostText:
        (text: string, pos?: number) =>
        ({ state, tr, dispatch }: any) => {
          const targetPos = pos ?? state.selection.to;
          if (dispatch) {
            dispatch(tr.setMeta("ghostTextUpdate", { text, pos: targetPos }));
          }
          return true;
        },

      /**
       * Accepts the current ghost text and inserts it into the document.
       */
      acceptGhostText:
        () =>
        ({ tr, dispatch }: any) => {
          const { text, pos } = this.storage;
          if (!text || pos === -1) return false;

          if (dispatch) {
            tr.insertText(text, pos);
            tr.setMeta("ghostTextUpdate", { text: "", pos: -1 });
            dispatch(tr.scrollIntoView());
          }
          return true;
        },

      /**
       * Clears the current ghost text suggestion.
       */
      clearGhostText:
        () =>
        ({ tr, dispatch }: any) => {
          if (!this.storage.text) return false;
          if (dispatch) {
            dispatch(tr.setMeta("ghostTextUpdate", { text: "", pos: -1 }));
          }
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }: any) => {
        // Only hijack Tab if ghost text is actually present
        if (this.storage.text && this.storage.pos !== -1) {
          return editor.runCommand("acceptGhostText");
        }
        return false;
      },
      Escape: ({ editor }: any) => {
        return editor.runCommand("clearGhostText");
      },
    };
  },

  onSelection({ editor }) {
    // Auto-clear ghost text if selection moves away from the suggestion point
    if (this.storage.text && this.storage.pos !== -1) {
      const { to } = editor.getSelection();
      if (Math.abs(to - this.storage.pos) > 1) {
        editor.runCommand("clearGhostText");
      }
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        state: {
          init: () => ({ pos: -1, text: "" }),
          apply: (tr, value) => {
            // 1. Update from meta commands
            const meta = tr.getMeta("ghostTextUpdate");
            if (meta) {
              // Sync to storage via the extension instance
              this.storage.text = meta.text || "";
              this.storage.pos = meta.pos ?? -1;
              return { text: this.storage.text, pos: this.storage.pos };
            }

            // 2. Map position through transaction
            if (value.pos !== -1) {
              const mappedPos = tr.mapping.map(value.pos);
              // Validate mapped position - if invalid, clear ghost text
              if (mappedPos === -1 || mappedPos > tr.doc.content.size) {
                this.storage.text = "";
                this.storage.pos = -1;
                return { text: "", pos: -1 };
              }
              this.storage.pos = mappedPos;
              return { ...value, pos: mappedPos };
            }

            return value;
          },
        },
        props: {
          decorations: (state) => {
            const { text, pos } = this.storage;
            if (!text || pos === -1) return DecorationSet.empty;

            // Prevent rendering if the pos is invalid for current doc
            if (pos > state.doc.content.size) return DecorationSet.empty;

            const widget = Decoration.widget(
              pos,
              () => {
                const span = document.createElement("span");
                span.className = "ark-ghost-text";
                span.textContent = text;
                span.setAttribute("data-arkpad-ignore", "true");
                return span;
              },
              { side: 1 }
            );

            return DecorationSet.create(state.doc, [widget]);
          },
        },
      }),
    ];
  },
});

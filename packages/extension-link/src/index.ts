import { Extension, ArkpadCommandProps } from "@arkpad/core";
import type { MarkType } from "prosemirror-model";

export const Link = Extension.create({
  name: "link",

  addMarks() {
    return {
      link: {
        attrs: {
          href: {},
          target: { default: "_blank" },
        },
        inclusive: false,
        parseDOM: [
          {
            tag: "a[href]",
            getAttrs(dom: HTMLElement) {
              return {
                href: dom.getAttribute("href"),
                target: dom.getAttribute("target"),
              };
            },
          },
        ],
        toDOM(node: any) {
          return [
            "a",
            { ...node.attrs, class: "ark-link", rel: "noopener noreferrer nofollow" },
            0,
          ];
        },
      },
    };
  },

  addCommands() {
    return {
      setLink:
        (url: string) =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const markType = state.schema.marks.link as MarkType | undefined;
          if (!markType) return false;
          const { from, to, empty } = state.selection;

          let linkRange = { from, to };

          if (empty) {
            const cursorPos = state.selection.$from.pos;
            let linkFrom = -1;
            let linkTo = -1;
            // Use nodesBetween to find the text node containing the cursor with the link mark
            state.doc.nodesBetween(
              Math.max(0, cursorPos - 1),
              Math.min(state.doc.content.size, cursorPos + 1),
              (node, pos) => {
                if (node.isText && node.marks.some((m) => m.type === markType)) {
                  if (pos <= cursorPos && cursorPos <= pos + node.nodeSize) {
                    linkFrom = pos;
                    linkTo = pos + node.nodeSize;
                    return false;
                  }
                }
              }
            );

            if (linkFrom < 0) return false;
            linkRange = { from: linkFrom, to: linkTo };
          }

          if (dispatch) {
            dispatch(
              state.tr.addMark(linkRange.from, linkRange.to, markType.create({ href: url }))
            );
          }
          return true;
        },

      unsetLink:
        () =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const markType = state.schema.marks.link as MarkType | undefined;
          if (!markType) return false;
          const { empty } = state.selection;
          if (empty) {
            const cursorPos = state.selection.$from.pos;
            let linkFrom = -1;
            let linkTo = -1;
            state.doc.nodesBetween(0, state.doc.content.size, (node, pos) => {
              if (node.isText && node.marks.some((m) => m.type === markType)) {
                if (pos <= cursorPos && cursorPos < pos + node.nodeSize) {
                  linkFrom = pos;
                  linkTo = pos + node.nodeSize;
                  return false;
                }
              }
            });
            if (linkFrom < 0) return false;
            if (dispatch) dispatch(state.tr.removeMark(linkFrom, linkTo, markType));
          } else {
            const { from, to } = state.selection;
            if (dispatch) dispatch(state.tr.removeMark(from, to, markType));
          }
          return true;
        },

      toggleLink: (url?: string) => (props: ArkpadCommandProps) => {
        const { state, chain } = props;
        const { empty } = state.selection;
        if (empty) return false;
        const markType = state.schema.marks.link as MarkType | undefined;
        if (!markType) return false;
        const hasLink = state.selection.$from.marks().some((m) => m.type === markType);
        if (hasLink) {
          return chain().unsetLink().run();
        }
        if (url) {
          return chain().setLink(url).run();
        }
        return false;
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        const editor = (this as any).editor;
        if (!editor) return false;
        const { state } = editor;
        const { empty, from, to } = state.selection;
        const markType = state.schema.marks.link as MarkType | undefined;
        if (!markType || empty) return false;

        const hasLink = state.doc.rangeHasMark(from, to, markType);
        if (hasLink) {
          editor.runCommand("unsetLink");
          return true;
        }
        const selectionText = state.doc.textBetween(from, to);
        const url = prompt(
          "Enter URL:",
          selectionText.startsWith("http") ? selectionText : "https://"
        );
        if (url) {
          editor.runCommand("setLink", url);
        }
        return true;
      },
    };
  },
});

export default Link;

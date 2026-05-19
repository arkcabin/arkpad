import { Extension } from "../../sdk/Extension";

/**
 * TextDirection extension - RTL/LTR text direction support.
 */
export const TextDirection = Extension.create({
  name: "textDirection",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading", "blockquote", "listItem", "table_cell", "table_header"],
        attributes: {
          textDirection: {
            default: "ltr",
            parseHTML: (element: HTMLElement) =>
              element.style.direction || element.getAttribute("dir") || "ltr",
            renderHTML: (attributes: any) => {
              if (attributes.textDirection === "ltr") return {};
              return {
                dir: attributes.textDirection,
                style: `direction: ${attributes.textDirection}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextDirection:
        (direction: "ltr" | "rtl" | "auto") =>
        ({ state, dispatch }: any) => {
          const { selection } = state;
          const { $from, $to } = selection;

          const tr = state.tr;
          let hasChanged = false;

          const supportedTypes = [
            "paragraph",
            "heading",
            "blockquote",
            "listItem",
            "table_cell",
            "table_header",
          ];

          state.doc.nodesBetween($from.pos, $to.pos, (node: any, pos: number) => {
            if (node.type.isBlock && supportedTypes.includes(node.type.name)) {
              tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                textDirection: direction,
              });
              hasChanged = true;
            }
            return true;
          });

          if (hasChanged && dispatch) {
            dispatch(tr);
          }
          return hasChanged;
        },
      unsetTextDirection: () => () => {
        return this.editor!.runCommand("setTextDirection", "ltr");
      },
    };
  },
});

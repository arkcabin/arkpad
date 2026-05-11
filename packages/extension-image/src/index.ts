import { Node, ArkpadCommandProps, PMNode } from "@arkpad/core";
import { NodeSelection } from "prosemirror-state";
import { ImageNodeView } from "./ImageView";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setImage: (options: {
      src: string;
      alt?: string;
      title?: string;
      width?: string;
      align?: string;
    }) => void;
    updateImage: (options: {
      src?: string;
      alt?: string;
      title?: string;
      width?: string;
      align?: string;
    }) => void;
  }
}

export interface ImageOptions {
  HTMLAttributes: Record<string, any>;
}

export const Image = Node.create<ImageOptions>({
  name: "image",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: false,
  group: "block",
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
      },
      align: {
        default: "center", // left, center, right
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom: any) => ({
          src: dom.getAttribute("src"),
          alt: dom.getAttribute("alt"),
          title: dom.getAttribute("title"),
          width: dom.style.width || dom.getAttribute("width") || "100%",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    const { align, width, ...rest } = HTMLAttributes;

    return [
      "div",
      {
        class: `ark-image-container ark-align-${align}`,
        style: `width: ${width}; display: flex; justify-content: ${
          align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start"
        }; margin: 1.5rem auto;`,
      },
      [
        "img",
        {
          ...this.options.HTMLAttributes,
          ...rest,
          style: "max-width: 100%; height: auto; border-radius: 8px;",
        },
      ],
    ];
  },

  addNodeView() {
    return (props: any) => new ImageNodeView(props.node, props.view, props.getPos);
  },

  addCommands() {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string; width?: string; align?: string }) =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { schema, tr } = state;
          const type = schema.nodes.image;
          if (!type) return false;

          if (dispatch) {
            dispatch(tr.replaceSelectionWith(type.create(options)).scrollIntoView());
          }

          return true;
        },
      updateImage:
        (
          options: Partial<{
            src: string;
            alt?: string;
            title?: string;
            width?: string;
            align?: string;
          }>
        ) =>
        ({ state, dispatch }: ArkpadCommandProps) => {
          const { selection, tr } = state;

          if (!(selection instanceof NodeSelection) || selection.node.type.name !== "image") {
            return false;
          }

          if (dispatch) {
            dispatch(
              tr.setNodeMarkup(selection.from, undefined, {
                ...selection.node.attrs,
                ...options,
              })
            );
          }

          return true;
        },
    };
  },
});

export default Image;

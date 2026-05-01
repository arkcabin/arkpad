import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const Image = Extension.create({
  name: "image",

  addNodes() {
    return {
      image: {
        inline: true,
        attrs: {
          src: {},
          alt: { default: null },
          title: { default: null },
        },
        group: "inline",
        draggable: true,
        parseDOM: [
          {
            tag: "img[src]",
            getAttrs: (dom: HTMLElement) => ({
              src: dom.getAttribute("src"),
              title: dom.getAttribute("title"),
              alt: dom.getAttribute("alt"),
            }),
          },
        ],
        toDOM(node: any) {
          const { src, alt, title } = node.attrs;
          return ["img", { src, alt, title }];
        },
      },
    };
  },

  addCommands() {
    return {
      setImage: (options: { src: string; alt?: string; title?: string }) => ({ chain }: ArkpadCommandProps) => {
        return chain().insertNode("image", options);
      },
    };
  },
});

export default Image;

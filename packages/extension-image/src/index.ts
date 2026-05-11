import { Extension, ArkpadCommandProps } from "@arkpad/core";

export const Image = Extension.create({
  name: "image",

  addNodes() {
    return {
      image: {
        inline: false,
        attrs: {
          src: {},
          alt: { default: null },
          title: { default: null },
        },
        group: "block widget",
        draggable: true,
        parseDOM: [
          {
            tag: "div.ark-image-block",
            getAttrs: (dom: HTMLElement) => {
              const img = dom.querySelector("img");
              return {
                src: img?.getAttribute("src"),
                title: img?.getAttribute("title"),
                alt: img?.getAttribute("alt"),
              };
            },
          },
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
          return ["div", { class: "ark-image-block" }, ["img", { src, alt, title }]];
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

import { Extension, ArkpadCommandProps } from "@arkpad/core";

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
          return ["a", { ...node.attrs, rel: "noopener noreferrer nofollow" }, 0];
        },
      },
    };
  },

  addCommands() {
    return {
      toggleLink: (url: string) => ({ chain }: ArkpadCommandProps) => {
        return chain().toggleMark("link", { href: url }).run();
      },
    };
  },
});

export default Link;

import { Extension } from "@arkpad/core";
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
                        getAttrs: (dom) => ({
                            src: dom.getAttribute("src"),
                            title: dom.getAttribute("title"),
                            alt: dom.getAttribute("alt"),
                        }),
                    },
                ],
                toDOM(node) {
                    const { src, alt, title } = node.attrs;
                    return ["img", { src, alt, title }];
                },
            },
        };
    },
    addCommands() {
        return {
            setImage: (options) => ({ chain }) => {
                return chain().insertNode("image", options).run();
            },
        };
    },
});
export default Image;

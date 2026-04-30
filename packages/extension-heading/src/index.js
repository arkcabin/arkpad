import { Extension } from "@arkpad/core";
export const Heading = Extension.create({
    name: "heading",
    addOptions() {
        return {
            levels: [1, 2, 3, 4, 5, 6],
        };
    },
    addNodes() {
        return {
            heading: {
                attrs: { level: { default: 1 } },
                content: "inline*",
                group: "block",
                defining: true,
                parseDOM: this.options.levels.map((level) => ({
                    tag: `h${level}`,
                    attrs: { level },
                })),
                toDOM(node) {
                    return [`h${node.attrs.level}`, 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleHeading: (attrs) => ({ chain }) => {
                return chain().toggleBlock("heading", attrs).run();
            },
        };
    },
    addKeyboardShortcuts() {
        return this.options.levels.reduce((shortcuts, level) => ({
            ...shortcuts,
            [`Mod-Alt-${level}`]: () => this.editor.runCommand("toggleHeading", { level }),
        }), {});
    },
});
export default Heading;

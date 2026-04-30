import { Extension } from "@arkpad/core";
export const Bold = Extension.create({
    name: "bold",
    addMarks() {
        return {
            strong: {
                parseDOM: [
                    { tag: "strong" },
                    { tag: "b", getAttrs: (node) => node.style.fontWeight !== "normal" && null },
                    {
                        style: "font-weight",
                        getAttrs: (value) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
                    },
                ],
                toDOM() {
                    return ["strong", 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleBold: () => ({ chain }) => {
                return chain().toggleMark("strong").run();
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-b": () => this.editor.runCommand("toggleBold"),
        };
    },
});
export default Bold;

import { Extension } from "@arkpad/core";
export const Blockquote = Extension.create({
    name: "blockquote",
    addNodes() {
        return {
            blockquote: {
                content: "block+",
                group: "block",
                defining: true,
                parseDOM: [{ tag: "blockquote" }],
                toDOM() {
                    return ["blockquote", 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleBlockquote: () => ({ chain }) => {
                return chain().toggleBlock("blockquote").run();
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-Shift-b": () => this.editor.runCommand("toggleBlockquote"),
        };
    },
});
export default Blockquote;

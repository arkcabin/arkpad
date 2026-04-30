import { Extension } from "@arkpad/core";
export const Italic = Extension.create({
    name: "italic",
    addMarks() {
        return {
            em: {
                parseDOM: [
                    { tag: "i" },
                    { tag: "em" },
                    { style: "font-style=italic" },
                ],
                toDOM() {
                    return ["em", 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleItalic: () => ({ chain }) => {
                return chain().toggleMark("em").run();
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-i": () => this.editor.runCommand("toggleItalic"),
        };
    },
});
export default Italic;

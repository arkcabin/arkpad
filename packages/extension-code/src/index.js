import { Extension } from "@arkpad/core";
export const Code = Extension.create({
    name: "code",
    addMarks() {
        return {
            code: {
                parseDOM: [{ tag: "code" }],
                toDOM() {
                    return ["code", 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleCode: () => ({ chain }) => {
                return chain().toggleMark("code").run();
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-e": () => this.editor.runCommand("toggleCode"),
        };
    },
});
export default Code;

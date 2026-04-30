import { Extension } from "@arkpad/core";
export const Superscript = Extension.create({
    name: "superscript",
    addMarks() {
        return {
            superscript: {
                parseDOM: [
                    { tag: "sup" },
                    { style: "vertical-align", getAttrs: (value) => value === "super" && null },
                ],
                toDOM() {
                    return ["sup", 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleSuperscript: () => (props) => {
                const type = props.state.schema.marks.superscript;
                if (!type)
                    return false;
                return this.editor.runCommand('toggleMark', type, {}, props);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-.": () => this.editor.runCommand("toggleSuperscript"),
        };
    },
});
export default Superscript;

import { Extension } from "@arkpad/core";
export const Subscript = Extension.create({
    name: "subscript",
    addMarks() {
        return {
            subscript: {
                parseDOM: [
                    { tag: "sub" },
                    { style: "vertical-align", getAttrs: (value) => value === "sub" && null },
                ],
                toDOM() {
                    return ["sub", 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleSubscript: () => (props) => {
                const type = props.state.schema.marks.subscript;
                if (!type)
                    return false;
                return this.editor.runCommand('toggleMark', type, {}, props);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-,": () => this.editor.runCommand("toggleSubscript"),
        };
    },
});
export default Subscript;

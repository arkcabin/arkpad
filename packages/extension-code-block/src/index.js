import { Extension } from "@arkpad/core";
export const CodeBlock = Extension.create({
    name: "codeBlock",
    addNodes() {
        return {
            code_block: {
                content: "text*",
                marks: "",
                group: "block",
                code: true,
                defining: true,
                parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
                toDOM() {
                    return ["pre", ["code", 0]];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleCodeBlock: () => (props) => {
                const type = props.state.schema.nodes.code_block;
                if (!type)
                    return false;
                return this.editor.runCommand('toggleBlock', type, {}, props);
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-Alt-c": () => this.editor.runCommand("toggleCodeBlock"),
        };
    },
});
export default CodeBlock;

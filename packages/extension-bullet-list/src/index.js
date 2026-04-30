import { Extension } from "@arkpad/core";
import ListItem from "@arkpad/extension-list-item";
export const BulletList = Extension.create({
    name: "bulletList",
    addExtensions() {
        return [ListItem];
    },
    addNodes() {
        return {
            bullet_list: {
                content: "list_item+",
                group: "block",
                parseDOM: [{ tag: "ul" }],
                toDOM() {
                    return ["ul", 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleBulletList: () => ({ chain }) => {
                return chain().toggleList("bullet_list", "list_item").run();
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-Shift-8": () => this.editor.runCommand("toggleBulletList"),
        };
    },
});
export default BulletList;

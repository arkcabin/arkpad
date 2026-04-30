import { Extension } from "@arkpad/core";
import ListItem from "@arkpad/extension-list-item";
export const OrderedList = Extension.create({
    name: "orderedList",
    addExtensions() {
        return [ListItem];
    },
    addNodes() {
        return {
            ordered_list: {
                content: "list_item+",
                group: "block",
                attrs: { order: { default: 1 } },
                parseDOM: [{
                        tag: "ol",
                        getAttrs(dom) {
                            return { order: dom.hasAttribute("start") ? parseInt(dom.getAttribute("start"), 10) : 1 };
                        },
                    }],
                toDOM(node) {
                    return node.attrs.order === 1 ? ["ol", 0] : ["ol", { start: node.attrs.order }, 0];
                },
            },
        };
    },
    addCommands() {
        return {
            toggleOrderedList: () => ({ chain }) => {
                return chain().toggleList("ordered_list", "list_item").run();
            },
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-Shift-7": () => this.editor.runCommand("toggleOrderedList"),
        };
    },
});
export default OrderedList;

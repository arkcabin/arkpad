import { Extension } from "@arkpad/core";
// @ts-expect-error - Internal packages might not be built yet in monorepo
import { Marks } from "../../extension-marks/src/index";
// @ts-expect-error - Internal packages might not be built yet in monorepo
import { Nodes } from "../../extension-nodes/src/index";
// @ts-expect-error - Internal packages might not be built yet in monorepo
import { Table } from "../../extension-table/src/index";
import { history, undo, redo } from "prosemirror-history";
import { placeholder as createPlaceholderPlugin } from "prosemirror-placeholder";
export const History = Extension.create({
    name: "history",
    addCommands() {
        return {
            undo: () => undo,
            redo: () => redo,
        };
    },
    addKeyboardShortcuts() {
        return {
            "Mod-z": undo,
            "Mod-y": redo,
            "Mod-Shift-z": redo,
        };
    },
    addProseMirrorPlugins() {
        return [history()];
    },
});
export const Placeholder = Extension.create({
    name: "placeholder",
    addOptions() {
        return {
            placeholder: "Start writing...",
        };
    },
    addProseMirrorPlugins() {
        return [createPlaceholderPlugin(this.options.placeholder)];
    },
});
export const StarterKit = Extension.create({
    name: "starterKit",
    addOptions() {
        return {
            placeholder: "Start writing...",
            history: true,
            marks: true,
            nodes: true,
            table: true,
        };
    },
    addExtensions() {
        const extensions = [];
        if (this.options.history)
            extensions.push(History);
        if (this.options.placeholder)
            extensions.push(Placeholder.configure({ placeholder: this.options.placeholder }));
        if (this.options.marks)
            extensions.push(...Marks);
        if (this.options.nodes)
            extensions.push(...Nodes);
        if (this.options.table)
            extensions.push(Table);
        return extensions;
    },
});
export default StarterKit;

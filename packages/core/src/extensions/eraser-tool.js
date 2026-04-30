import { Extension } from "./Extension";
import { Plugin, PluginKey } from "prosemirror-state";
export const eraserToolPluginKey = new PluginKey("eraserTool");
export const EraserTool = Extension.create({
    name: "eraserTool",
    addOptions() {
        return {
            activeClass: "ark-eraser-mode",
        };
    },
    addStorage() {
        return {
            active: false,
        };
    },
    addCommands() {
        return {
            setEraserTool: (options) => (props) => {
                const { state, dispatch } = props;
                if (dispatch) {
                    const tr = state.tr;
                    tr.setMeta(eraserToolPluginKey, options.active);
                    if (options.active) {
                        tr.setMeta("eraser-tool-active", true); // For other plugins to react
                    }
                    dispatch(tr);
                }
                return true;
            },
            toggleEraserTool: () => (props) => {
                const { state, dispatch } = props;
                if (dispatch) {
                    const pluginState = eraserToolPluginKey.getState(state);
                    const tr = state.tr;
                    const nextActive = !pluginState?.active;
                    tr.setMeta(eraserToolPluginKey, nextActive);
                    if (nextActive) {
                        tr.setMeta("eraser-tool-active", true);
                    }
                    dispatch(tr);
                }
                return true;
            },
        };
    },
    addProseMirrorPlugins() {
        const storage = this.storage;
        const { activeClass } = this.options;
        return [
            new Plugin({
                key: eraserToolPluginKey,
                state: {
                    init() {
                        return { active: false };
                    },
                    apply(tr, value) {
                        const meta = tr.getMeta(eraserToolPluginKey);
                        if (typeof meta === "boolean") {
                            return { active: meta };
                        }
                        // Deactivate if highlighter is activated or explicitly requested
                        if (tr.getMeta("highlighter-tool-active") === true || tr.getMeta("deactivate-painting-tools") === true) {
                            return { active: false };
                        }
                        return value;
                    },
                },
                view: () => {
                    return {
                        update: (view) => {
                            const state = eraserToolPluginKey.getState(view.state);
                            if (state && storage.active !== state.active) {
                                storage.active = state.active;
                            }
                        },
                    };
                },
                props: {
                    attributes: (state) => {
                        const pluginState = eraserToolPluginKey.getState(state);
                        const attrs = {};
                        if (pluginState?.active) {
                            attrs.class = activeClass;
                            attrs["data-ark-mode"] = "eraser";
                        }
                        return attrs;
                    },
                },
                appendTransaction: (transactions, oldState, newState) => {
                    const pluginState = eraserToolPluginKey.getState(newState);
                    if (!pluginState?.active)
                        return null;
                    // Ignore our own eraser application to prevent loops
                    if (transactions.some(tr => tr.getMeta("eraser-tool-apply")))
                        return null;
                    // If no transactions changed the selection or explicitly triggered an update, do nothing
                    const selectionChanged = transactions.some(tr => tr.selectionSet || tr.getMeta(eraserToolPluginKey) !== undefined);
                    if (!selectionChanged)
                        return null;
                    const { selection } = newState;
                    if (selection.empty)
                        return null;
                    const { from, to } = selection;
                    const tr = newState.tr;
                    const highlightMark = newState.schema.marks.highlight;
                    if (highlightMark) {
                        // Specifically remove highlights
                        tr.removeMark(from, to, highlightMark);
                    }
                    else {
                        // Fallback to remove all if highlight mark not found (though it should be)
                        tr.removeMark(from, to, null);
                    }
                    tr.setMeta("eraser-tool-apply", true);
                    return tr.steps.length > 0 ? tr : null;
                },
            }),
        ];
    },
});

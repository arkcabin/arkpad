import { Extension } from "./Extension";
import { setTextAlign } from "./utils";
export const TEXT_ALIGN = {
    LEFT: "left",
    CENTER: "center",
    RIGHT: "right",
    JUSTIFY: "justify",
};
export function createTextAlign() {
    return Extension.create({
        name: "textAlign",
        addCommands: () => ({
            /**
             * Set text alignment for the current block.
             * Handles both direct string and object arguments.
             */
            setTextAlign: (args) => (props) => {
                const { state, dispatch } = props;
                const align = typeof args === "string" ? args : args.align;
                return setTextAlign(align)(state, dispatch);
            },
            /**
             * Convenience commands for common alignments.
             */
            setTextAlignLeft: () => (props) => setTextAlign(TEXT_ALIGN.LEFT)(props.state, props.dispatch),
            setTextAlignCenter: () => (props) => setTextAlign(TEXT_ALIGN.CENTER)(props.state, props.dispatch),
            setTextAlignRight: () => (props) => setTextAlign(TEXT_ALIGN.RIGHT)(props.state, props.dispatch),
            setTextAlignJustify: () => (props) => setTextAlign(TEXT_ALIGN.JUSTIFY)(props.state, props.dispatch),
        }),
        addKeyboardShortcuts: () => ({
            "Mod-Shift-l": () => setTextAlign(TEXT_ALIGN.LEFT),
            "Mod-Shift-e": () => setTextAlign(TEXT_ALIGN.CENTER),
            "Mod-Shift-r": () => setTextAlign(TEXT_ALIGN.RIGHT),
        }),
    });
}

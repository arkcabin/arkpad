import { PluginKey } from "prosemirror-state";
import { Extension } from "./Extension";
export interface HighlighterToolOptions {
    /**
     * The class name applied to the editor when the highlighter tool is active.
     */
    activeClass: string;
}
export interface HighlighterToolStorage {
    /**
     * Whether the highlighter tool is currently active.
     * This is kept in sync with the PluginState for reactivity.
     */
    active: boolean;
}
export declare const highlighterToolPluginKey: PluginKey<any>;
export declare const HighlighterTool: Extension<HighlighterToolOptions, HighlighterToolStorage>;

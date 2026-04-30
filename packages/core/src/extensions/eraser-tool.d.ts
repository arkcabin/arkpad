import { Extension } from "./Extension";
import { PluginKey } from "prosemirror-state";
export interface EraserToolOptions {
    /**
     * The class name applied to the editor when the eraser tool is active.
     */
    activeClass: string;
}
export interface EraserToolStorage {
    /**
     * Whether the eraser tool is currently active.
     */
    active: boolean;
}
export declare const eraserToolPluginKey: PluginKey<any>;
export declare const EraserTool: Extension<EraserToolOptions, EraserToolStorage>;

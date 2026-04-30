import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Extension } from "./extensions/Extension";
import { ArkpadEditorAPI } from "./types";
export interface BubbleMenuPluginProps {
    id?: string;
    editor: ArkpadEditorAPI;
    element: HTMLElement;
    offset?: number;
    shouldShow?: (props: {
        state: EditorState;
        from: number;
        to: number;
        empty: boolean;
        view: EditorView;
    }) => boolean;
}
export declare const BubbleMenuPluginKey: PluginKey<any>;
export declare class BubbleMenuView {
    id?: string;
    editor: ArkpadEditorAPI;
    element: HTMLElement;
    view: EditorView;
    shouldShow: BubbleMenuPluginProps["shouldShow"];
    offset: number;
    private rafId;
    private hideTimeout;
    constructor(props: BubbleMenuPluginProps & {
        view: EditorView;
    });
    handleScroll(): void;
    update(view: EditorView): void;
    show(): void;
    hide(): void;
    updatePosition(): void;
    destroy(): void;
}
export declare const BubbleMenu: (options: BubbleMenuPluginProps) => Extension;

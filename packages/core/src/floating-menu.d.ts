import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Extension } from "./extensions/Extension";
export interface FloatingMenuPluginProps {
    editor: any;
    element: HTMLElement;
    shouldShow?: (props: {
        state: EditorState;
        view: EditorView;
    }) => boolean;
}
export declare const FloatingMenuPluginKey: PluginKey<any>;
export declare class FloatingMenuView {
    editor: any;
    element: HTMLElement;
    view: EditorView;
    shouldShow: FloatingMenuPluginProps["shouldShow"];
    constructor(props: FloatingMenuPluginProps & {
        view: EditorView;
    });
    update(view: EditorView): void;
    show(): void;
    hide(): void;
    updatePosition(): void;
    destroy(): void;
}
export declare const FloatingMenu: (options: FloatingMenuPluginProps) => Extension;

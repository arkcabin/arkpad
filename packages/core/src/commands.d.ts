import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { ChainedCommands, ArkpadCommandRegistry, ArkpadContent } from "./types";
/**
 * CommandManager handles the chaining of commands in a single transaction.
 */
export declare class CommandManager implements ChainedCommands {
    private state;
    private transaction;
    private view?;
    private commands;
    private dispatch?;
    private shouldDispatch;
    private schema;
    private callbacks;
    constructor(options: {
        state: EditorState;
        commands: ArkpadCommandRegistry;
        view?: EditorView;
        dispatch?: (tr: Transaction) => void;
        shouldDispatch?: boolean;
        schema: Schema;
    });
    focus(position?: "start" | "end" | number | null): ChainedCommands;
    insertContent(content: ArkpadContent, format?: "html" | "markdown" | "json"): ChainedCommands;
    scrollIntoView(): ChainedCommands;
    setMeta(key: any, value: any): ChainedCommands;
    command(fn: (props: {
        state: EditorState;
        tr: Transaction;
        dispatch?: (tr: Transaction) => void;
        view?: EditorView;
    }) => boolean): ChainedCommands;
    run(): boolean;
}

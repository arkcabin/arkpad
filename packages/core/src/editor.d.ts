import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ExtensionManager } from "./extensions/ExtensionManager";
import { Extension } from "./extensions/Extension";
import type { ArkpadCommandProxy, ArkpadContent, ArkpadDocJSON, ArkpadEditorAPI, ArkpadEditorOptions, ChainedCommands, SearchResult } from "./types";
/**
 * The core editor class for Arkpad.
 * Handles the ProseMirror view, state, and command execution.
 */
export declare class ArkpadEditor implements ArkpadEditorAPI {
    readonly element: HTMLElement;
    commands: ArkpadCommandProxy;
    extensionManager: ExtensionManager;
    readonly storage: Record<string, any>;
    private readonly onCreate?;
    private readonly onUpdate?;
    private readonly onTransaction?;
    private readonly onSelectionUpdate?;
    private readonly onPaste?;
    private interceptors;
    private readonly onInterceptor?;
    private readonly onDestroy?;
    private readonly nodeViews;
    private serializer;
    private editable;
    private view;
    private destroyed;
    private listeners;
    constructor(options: ArkpadEditorOptions);
    private createState;
    private refreshState;
    private emitUpdate;
    /**
     * Returns the current editor state.
     */
    getState(): EditorState;
    /**
     * Returns the ProseMirror EditorView.
     */
    getView(): EditorView;
    /**
     * Returns the document as an HTML string.
     */
    getHTML(): string;
    /**
     * Returns the document as a JSON object.
     */
    getJSON(): ArkpadDocJSON;
    /**
     * Returns the document as plain text.
     */
    getText(): string;
    /**
     * Returns the document as a Markdown string.
     */
    getMarkdown(): string;
    /**
     * Runs a specific command by name.
     */
    runCommand(name: string, ...args: any[]): any;
    /**
     * Checks if a command can be executed without actually running it.
     */
    canRunCommand(name: string, ...args: any[]): boolean;
    /**
     * Returns a command chain.
     */
    chain(): ChainedCommands;
    /**
     * Returns a command chain to check if multiple commands can be executed.
     */
    can(): ChainedCommands;
    /**
     * Selection API
     */
    getSelection(): {
        from: number;
        to: number;
        empty: boolean;
    };
    setSelection(range: {
        from: number;
        to: number;
    } | number): void;
    selectAll(): void;
    /**
     * Coordinate API
     */
    getCoords(pos?: number): {
        left: number;
        right: number;
        top: number;
        bottom: number;
    } | null;
    /**
     * Search & Replace API
     */
    search(query: string | RegExp): SearchResult[];
    replace(query: string | RegExp, replacement: string): boolean;
    /**
     * Checks if a specific mark or node is active at the current selection.
     */
    isActive(name: string, attrs?: Record<string, any>): boolean;
    /**
     * Gets the attributes of an active mark or node at the current selection.
     */
    getAttributes(name: string): Record<string, any> | null;
    /**
     * Sets the editor content.
     */
    setContent(content: ArkpadContent, format?: "html" | "markdown" | "json", emitUpdate?: boolean): void;
    /**
     * Clears the editor content.
     */
    clearContent(emitUpdate?: boolean): void;
    /**
     * Focuses the editor.
     */
    focus(pos?: "start" | "end" | number): void;
    /**
     * Blurs the editor.
     */
    blur(): void;
    /**
     * Sets the editable state of the editor.
     */
    setEditable(editable: boolean): void;
    /**
     * Returns whether the editor is editable.
     */
    isEditable(): boolean;
    /**
     * Registers a new extension.
     */
    registerExtension(extension: Extension): void;
    /**
     * Registers multiple extensions.
     */
    registerExtensions(extensions: Extension[]): void;
    /**
     * Unregisters an extension by name or unique ID.
     */
    unregisterExtension(nameOrId: string): void;
    /**
     * Subscribes to editor updates.
     * @param callback The function to call on update.
     * @returns A cleanup function to unsubscribe.
     */
    subscribe(callback: (editor: ArkpadEditorAPI) => void): () => void;
    /**
     * Internal helper to create the commands proxy for superior DX.
     */
    private createCommandsProxy;
    /**
     * Registers a new interceptor.
     */
    addInterceptor(interceptor: (props: {
        editor: ArkpadEditorAPI;
        transaction: Transaction;
    }) => Transaction | boolean | null): void;
    /**
     * Destroys the editor instance.
     */
    destroy(): void;
}
/**
 * Helper function to create an Arkpad editor instance.
 */
export declare function createArkpadEditor(options: ArkpadEditorOptions): ArkpadEditor;

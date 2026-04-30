import { EditorState, Transaction, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Slice, Schema } from "prosemirror-model";
import { ChainedCommands, ArkpadCommandRegistry, ArkpadContent } from "./types";
import { parseContent } from "./utils";

/**
 * CommandManager handles the chaining of commands in a single transaction.
 * Optimized for performance and reliability.
 */
export class CommandManager implements ChainedCommands {
  private state: EditorState;
  private transaction: Transaction;
  private view?: EditorView;
  private commands: ArkpadCommandRegistry;
  private dispatch?: (tr: Transaction) => void;
  private shouldDispatch: boolean;
  private schema: Schema;
  private callbacks: ((props: {
    state: EditorState;
    tr: Transaction;
    view?: EditorView;
  }) => boolean)[] = [];

  constructor(options: {
    state: EditorState;
    commands: ArkpadCommandRegistry;
    view?: EditorView;
    dispatch?: (tr: Transaction) => void;
    shouldDispatch?: boolean;
    schema: Schema;
  }) {
    this.state = options.state;
    this.commands = options.commands;
    this.view = options.view;
    this.dispatch = options.dispatch;
    this.shouldDispatch = options.shouldDispatch ?? true;
    this.transaction = this.state.tr;
    this.schema = options.schema;

    // Build the proxy to allow calling commands as methods
    return new Proxy(this, {
      get: (target, prop: PropertyKey) => {
        if (typeof prop === "string" && prop in target) {
          return (target as any)[prop];
        }

        if (typeof prop !== "string") return undefined;

        const command = this.commands[prop];
        if (!command) {
          return undefined;
        }

        return (...args: any[]) => {
          this.callbacks.push(({ state, tr, view }) => {
            const result = (command as any)(...args);

            if (typeof result === "function") {
              // Create a sub-chain that uses the master transaction
              const subChain = new CommandManager({
                state,
                commands: this.commands,
                view,
                dispatch: (tr2: Transaction) => {
                  // Apply steps from the sub-transaction to our master transaction
                  tr2.steps.forEach((step) => {
                    try {
                      tr.step(step);
                    } catch (e) {
                      console.warn("[Arkpad] Step apply failed:", e);
                    }
                  });
                },
                shouldDispatch: false, // Don't dispatch - we're building the master tr
                schema: this.schema,
              });

              const props = {
                state,
                dispatch: (tr2: Transaction) => {
                  tr2.steps.forEach((step) => {
                    try {
                      tr.step(step);
                    } catch (e) {
                      console.warn("[Arkpad] Step apply failed:", e);
                    }
                  });
                },
                view,
                tr,
                editor: undefined as any,
                chain: () => subChain,
                can: () => undefined as any,
              };

              try {
                // Try passing as ProseMirror command first (state, dispatch, view)
                if (result.length >= 2) {
                  return result(state, props.dispatch, view);
                }
                // Otherwise, pass as Arkpad Thunk (props)
                return result(props);
              } catch (e) {
                console.warn("[Arkpad] Cmd failed:", e);
                return false;
              }
            }
            return !!result;
          });
          return this;
        };
      },
    });
  }

  public focus(position?: "start" | "end" | number | null): ChainedCommands {
    this.callbacks.push(({ tr }) => {
      if (this.view) {
        this.view.focus();
      }

      if (position === undefined || position === null) {
        return true;
      }

      let selection: TextSelection;
      if (position === "start") {
        selection = TextSelection.create(tr.doc, 0);
      } else if (position === "end") {
        selection = TextSelection.create(tr.doc, tr.doc.content.size);
      } else {
        const pos = Math.max(0, Math.min(position, tr.doc.content.size));
        selection = TextSelection.create(tr.doc, pos);
      }

      tr.setSelection(selection);
      return true;
    });
    return this;
  }

  public insertContent(
    content: ArkpadContent,
    format?: "html" | "markdown" | "json"
  ): ChainedCommands {
    this.callbacks.push(({ tr }) => {
      const parsedDoc = parseContent(content, this.schema, format);
      const slice = new Slice(parsedDoc.content, 0, 0);
      tr.replaceSelection(slice);
      return true;
    });
    return this;
  }

  public scrollIntoView(): ChainedCommands {
    this.callbacks.push(({ tr }) => {
      tr.scrollIntoView();
      return true;
    });
    return this;
  }

  public setMeta(key: any, value: any): ChainedCommands {
    this.callbacks.push(({ tr }) => {
      tr.setMeta(key, value);
      return true;
    });
    return this;
  }

  public command(
    fn: (props: {
      state: EditorState;
      tr: Transaction;
      dispatch?: (tr: Transaction) => void;
      view?: EditorView;
    }) => boolean
  ): ChainedCommands {
    this.callbacks.push(({ state, tr, view }) => {
      return fn({ state, tr, view });
    });
    return this;
  }

  public run(): boolean {
    const tr = this.transaction;
    let currentState = this.state;
    let allSuccessful = true;

    // Fast Path: If only one callback, skip state application loop
    if (this.callbacks.length === 1) {
      try {
        const success = this.callbacks[0]!({ state: currentState, tr, view: this.view });
        if (success && this.shouldDispatch && this.dispatch) {
          this.dispatch(tr);
        }
        return success;
      } catch (e) {
        console.warn("[Arkpad] Fast path failed:", e);
        return false;
      }
    }

    for (const callback of this.callbacks) {
      let success: boolean;
      try {
        success = callback({ state: currentState, tr, view: this.view });
      } catch (e) {
        console.warn("[Arkpad] Callback failed:", e);
        allSuccessful = false;
        break;
      }

      if (!success) {
        allSuccessful = false;
        break;
      }

      // Apply the transaction to state so next command sees updated document
      if (tr.steps.length > 0) {
        try {
          currentState = currentState.apply(tr);
        } catch (e) {
          console.warn("[Arkpad] State apply failed:", e);
        }
      }
    }

    if (allSuccessful && this.shouldDispatch && this.dispatch) {
      try {
        this.dispatch(tr);
      } catch (e) {
        console.warn("[Arkpad] Dispatch failed:", e);
        allSuccessful = false;
      }
    }

    return allSuccessful;
  }
}

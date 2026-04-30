import { EditorState, Transaction, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Slice, Schema } from "prosemirror-model";
import { ChainedCommands, ArkpadCommandRegistry, ArkpadContent } from "./types";
import { parseContent } from "./utils";

/**
 * CommandManager handles the chaining of commands in a single transaction.
 * Stateless Singleton architecture for zero-latency execution.
 */
export class CommandManager implements ChainedCommands {
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
    this.commands = options.commands;
    this.view = options.view;
    this.dispatch = options.dispatch;
    this.shouldDispatch = options.shouldDispatch ?? true;
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
              const props = {
                state,
                dispatch: (tr2: Transaction) => {
                  tr2.steps.forEach((step) => {
                    try {
                      tr.step(step);
                    } catch (e) {
                      console.error("[Arkpad] Step apply failed inside chain:", e);
                    }
                  });
                },
                view,
                tr,
                editor: undefined as any,
                chain: () => this,
                can: () => undefined as any,
              };

              try {
                if (result.length >= 2) {
                  return result(state, props.dispatch, view);
                }
                return result(props);
              } catch (e) {
                console.error("[Arkpad] Command execution failed:", e);
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
    if (!this.view && !this.dispatch) {
      console.error("[Arkpad] Cannot run command: No view or dispatch provided.");
      return false;
    }

    // Always pull the freshest state from the view
    const currentState = this.view ? this.view.state : (this as any).state;
    const tr = currentState.tr;
    let intermediateState = currentState;
    let allSuccessful = true;

    const currentCallbacks = [...this.callbacks];
    this.callbacks = [];

    for (const callback of currentCallbacks) {
      try {
        const success = callback({ state: intermediateState, tr, view: this.view });
        if (!success) {
          allSuccessful = false;
          break;
        }

        // Update intermediate state if the transaction changed
        if (tr.steps.length > 0) {
          try {
            intermediateState = intermediateState.apply(tr);
          } catch {
            // If apply fails, we continue with current state but mark as failed
            console.warn("[Arkpad] Mid-chain state apply failed. Continuing with previous state.");
          }
        }
      } catch (e) {
        console.error("[Arkpad] Command chain callback failed:", e);
        allSuccessful = false;
        break;
      }
    }

    if (allSuccessful && this.shouldDispatch && this.dispatch) {
      try {
        this.dispatch(tr);
      } catch (e) {
        console.error("[Arkpad] Final dispatch failed:", e);
        allSuccessful = false;
      }
    }

    return allSuccessful;
  }
}

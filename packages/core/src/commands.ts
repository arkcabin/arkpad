import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { ChainedCommands, ArkpadCommandRegistry } from "./types";

/**
 * CommandManager handles the chaining of commands in a single transaction.
 */
export class CommandManager implements ChainedCommands {
  private state: EditorState;
  private transaction: Transaction;
  private view?: EditorView;
  private commands: ArkpadCommandRegistry;
  private dispatch?: (tr: Transaction) => void;
  private shouldDispatch: boolean;
  private callbacks: ((state: EditorState, tr: Transaction, view?: EditorView) => boolean)[] = [];

  constructor(options: {
    state: EditorState;
    commands: ArkpadCommandRegistry;
    view?: EditorView;
    dispatch?: (tr: Transaction) => void;
    shouldDispatch?: boolean;
  }) {
    this.state = options.state;
    this.commands = options.commands;
    this.view = options.view;
    this.dispatch = options.dispatch;
    this.shouldDispatch = options.shouldDispatch ?? true;
    this.transaction = this.state.tr;

    // Build the proxy to allow calling commands as methods
    return new Proxy(this, {
      get: (target, prop: string) => {
        if (prop in target) {
          return (target as any)[prop];
        }

        const command = this.commands[prop];
        if (!command) {
          return undefined;
        }

        return (...args: any[]) => {
          this.callbacks.push((state, tr, view) => {
            const result = (command as any)(...args);
            if (typeof result === "function") {
              return result(
                state,
                (tr2: Transaction) => {
                  // Merge the transaction into our main one
                  tr2.steps.forEach((step) => tr.step(step));
                },
                view
              );
            }
            return !!result;
          });
          return this;
        };
      },
    });
  }

  public run(): boolean {
    const currentState = this.state;
    const tr = this.transaction;
    let allSuccessful = true;

    for (const callback of this.callbacks) {
      const success = callback(currentState, tr, this.view);
      if (!success) {
        allSuccessful = false;
        break;
      }
    }

    if (allSuccessful && this.shouldDispatch && this.dispatch) {
      this.dispatch(tr);
    }

    return allSuccessful;
  }
}

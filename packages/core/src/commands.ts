import { EditorState, Transaction, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Slice } from "prosemirror-model";
import { ChainedCommands, ArkpadCommandRegistry, ArkpadContent } from "./types";
import { arkpadSchema } from "./schema";
import { parseContent } from "./utils";

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
          this.callbacks.push(({ state, tr, view }) => {
            const result = (command as any)(...args);
            if (typeof result === "function") {
              return result(
                state,
                (tr2: Transaction) => {
                  // If the command dispatches, we merge its steps into our master transaction
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
      const parsedDoc = parseContent(content, arkpadSchema, format);
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
    let currentState = this.state;
    const tr = this.transaction;
    let allSuccessful = true;
    let lastStepCount = 0;

    // Fast Path: If only one callback, skip state application loop
    if (this.callbacks.length === 1) {
      try {
        const success = this.callbacks[0]!({ state: currentState, tr, view: this.view });
        if (success && this.shouldDispatch && this.dispatch) {
          this.dispatch(tr);
        }
        return success;
      } catch {
        return false;
      }
    }

    for (const callback of this.callbacks) {
      // Execute callback with the latest state
      let success: boolean;
      try {
        success = callback({ state: currentState, tr, view: this.view });
      } catch {
        allSuccessful = false;
        break;
      }

      if (!success) {
        allSuccessful = false;
        break;
      }

      // Optimization: Only apply transaction if steps were actually added
      if (tr.steps.length > lastStepCount) {
        try {
          currentState = currentState.apply(tr);
          lastStepCount = tr.steps.length;
        } catch {
          allSuccessful = false;
          break;
        }
      }
    }

    if (allSuccessful && this.shouldDispatch && this.dispatch) {
      this.dispatch(tr);
    }

    return allSuccessful;
  }
}

import {
  EditorState,
  Transaction,
  TextSelection,
  Selection,
  NodeSelection,
} from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Slice, Schema } from "prosemirror-model";
import {
  ChainedCommands,
  ArkpadCommandRegistry,
  ArkpadContent,
  ArkpadEditorAPI,
  ArkpadCommandProps,
} from "./types";
import { parseContent } from "./utils";

/**
 * CommandManager handles the chaining of commands in a single transaction.
 * Shadow Engine architecture for high-performance virtual state simulation.
 */
class CommandManagerInstance {
  private view?: EditorView;
  private commands: ArkpadCommandRegistry;
  private dispatch?: (tr: Transaction) => void;
  private shouldDispatch: boolean;
  private schema: Schema;
  private editor: ArkpadEditorAPI;
  private virtualState: EditorState;
  private masterTransaction: Transaction;
  private allSuccessful = true;
  private executionLog: { command: string; status: string; duration: string }[] = [];

  constructor(options: {
    state: EditorState;
    commands: ArkpadCommandRegistry;
    view?: EditorView;
    dispatch?: (tr: Transaction) => void;
    shouldDispatch?: boolean;
    schema: Schema;
    editor: ArkpadEditorAPI;
  }) {
    this.commands = options.commands;
    this.view = options.view;
    this.dispatch = options.dispatch;
    this.shouldDispatch = options.shouldDispatch ?? true;
    this.schema = options.schema;
    this.editor = options.editor;

    // Initialize the shadow state and master transaction
    this.virtualState = options.state;
    this.masterTransaction = options.state.tr;

    // Build the proxy to allow calling commands as methods
    return new Proxy(this, {
      get: (target: CommandManagerInstance, prop: string) => {
        if (prop in target) {
          return (target as any)[prop];
        }

        const command = this.commands[prop];
        if (!command) {
          return undefined;
        }

        return (...args: any[]) => {
          if (!this.allSuccessful) return this;

          const startTime = performance.now();
          const result = (command as any)(...args);

          if (typeof result === "function") {
            // Shadow Execution: Run command against virtual state
            const localTr = this.virtualState.tr;

            const props: ArkpadCommandProps = {
              state: this.virtualState,
              dispatch: (tr2: Transaction) => {
                const stepCountBefore = localTr.steps.length;
                // Sync all steps from the dispatched transaction into our local tracker
                tr2.steps.forEach((step) => {
                  try {
                    localTr.step(step);
                  } catch (e) {
                    console.error("[Arkpad] Step apply failed inside shadow chain:", e);
                  }
                });
                if (tr2.selectionSet) {
                  // Map selection through the newly added steps to ensure it's relative to the new doc
                  const mappedSelection = tr2.selection.map(
                    localTr.doc,
                    localTr.mapping.slice(stepCountBefore)
                  );
                  localTr.setSelection(mappedSelection);
                }
              },
              view: this.view,
              tr: localTr,
              editor: this.editor,
              chain: () =>
                new CommandManager({
                  state: this.virtualState,
                  commands: this.commands,
                  view: this.view,
                  dispatch: (tr) => {
                    tr.steps.forEach((step) => localTr.step(step));
                    if (tr.selectionSet) localTr.setSelection(tr.selection);
                  },
                  shouldDispatch: true,
                  schema: this.schema,
                  editor: this.editor,
                }),
              can: () => undefined as any,
            };

            try {
              const success =
                result.length >= 2
                  ? (result as any)(this.virtualState, props.dispatch, this.view)
                  : (result as any)(props);

              if (success) {
                this.merge(localTr);
                this.executionLog.push({
                  command: prop,
                  status: "✅ Success",
                  duration: `${(performance.now() - startTime).toFixed(2)}ms`,
                });
              } else {
                this.allSuccessful = false;
                this.executionLog.push({
                  command: prop,
                  status: "❌ Rejected",
                  duration: "0ms",
                });
              }
            } catch (e) {
              console.error(`[Arkpad] Shadow command "${prop}" execution crashed:`, e);
              this.allSuccessful = false;
              this.executionLog.push({
                command: prop,
                status: "💥 Crash",
                duration: "0ms",
              });
            }
          } else if (!result) {
            this.allSuccessful = false;
            this.executionLog.push({
              command: prop,
              status: "❌ Rejected (Bool)",
              duration: "0ms",
            });
          } else {
            this.executionLog.push({
              command: prop,
              status: "✅ Success (Static)",
              duration: `${(performance.now() - startTime).toFixed(2)}ms`,
            });
          }

          return this;
        };
      },
    });
  }

  /**
   * Refined Merge Strategy:
   * 1. Updates master transaction steps.
   * 2. Updates virtual state.
   * 3. Syncs selection from state back to master transaction.
   */
  private merge(localTr: Transaction) {
    try {
      // 1. Accumulate steps into master transaction
      localTr.steps.forEach((step) => this.masterTransaction.step(step));

      // 2. Move virtual state forward
      this.virtualState = this.virtualState.apply(localTr);

      // 3. Sync Selection-Last: Derive selection from the NEW state to ensure document integrity
      if (localTr.selectionSet) {
        const { selection } = this.virtualState;
        const { from, to } = selection;

        if (selection instanceof NodeSelection) {
          this.masterTransaction.setSelection(
            NodeSelection.create(this.masterTransaction.doc, from)
          );
        } else {
          this.masterTransaction.setSelection(
            TextSelection.create(this.masterTransaction.doc, from, to)
          );
        }
      }
    } catch (e) {
      console.error("[Arkpad] Shadow merge failed (Refined):", e);
      this.allSuccessful = false;
    }
  }

  public focus(position?: "start" | "end" | number | null): ChainedCommands {
    if (!this.allSuccessful) return this as unknown as ChainedCommands;

    if (this.view) {
      this.view.focus();
    }

    if (position === undefined || position === null) {
      return this as unknown as ChainedCommands;
    }

    const doc = this.virtualState.doc;
    let selection: Selection;

    if (position === "start") {
      selection = Selection.near(doc.resolve(0));
    } else if (position === "end") {
      selection = Selection.near(doc.resolve(doc.content.size), -1);
    } else {
      const pos = Math.max(0, Math.min(position, doc.content.size));
      selection = Selection.near(doc.resolve(pos));
    }

    const localTr = this.virtualState.tr.setSelection(selection);
    this.merge(localTr);

    if (this.allSuccessful) {
      this.executionLog.push({
        command: `focus(${position})`,
        status: "✅ Success",
        duration: "N/A",
      });
    } else {
      this.executionLog.push({
        command: `focus(${position})`,
        status: "❌ Error",
        duration: "N/A",
      });
    }

    return this as unknown as ChainedCommands;
  }

  public insertContent(content: ArkpadContent): ChainedCommands {
    if (!this.allSuccessful) return this as unknown as ChainedCommands;

    try {
      const parsedDoc = parseContent(content, this.schema);
      const slice = new Slice(parsedDoc.content, 0, 0);
      const localTr = this.virtualState.tr.replaceSelection(slice);

      this.merge(localTr);

      this.executionLog.push({
        command: "insertContent",
        status: "✅ Success",
        duration: "N/A",
      });
    } catch (e) {
      console.warn("[Arkpad] insertContent failed:", e);
      this.allSuccessful = false;
      this.executionLog.push({
        command: "insertContent",
        status: "❌ Error",
        duration: "N/A",
      });
    }

    return this as unknown as ChainedCommands;
  }

  public scrollIntoView(): ChainedCommands {
    if (!this.allSuccessful) return this as unknown as ChainedCommands;
    this.masterTransaction.scrollIntoView();
    return this as unknown as ChainedCommands;
  }

  public setMeta(key: any, value: any): ChainedCommands {
    if (!this.allSuccessful) return this as unknown as ChainedCommands;
    this.masterTransaction.setMeta(key, value);
    return this as unknown as ChainedCommands;
  }

  public command(
    fn: (props: {
      state: EditorState;
      tr: Transaction;
      dispatch?: (tr: Transaction) => void;
      view?: EditorView;
      editor: ArkpadEditorAPI;
    }) => boolean,
    label: string = "custom_command"
  ): ChainedCommands {
    if (!this.allSuccessful) return this as unknown as ChainedCommands;

    const localTr = this.virtualState.tr;
    const success = fn({
      state: this.virtualState,
      tr: localTr,
      dispatch: (tr2: Transaction) => {
        const stepCountBefore = localTr.steps.length;
        // Sync steps from dispatched transaction into our local transaction
        tr2.steps.forEach((step) => {
          try {
            localTr.step(step);
          } catch (e) {
            console.error("[Arkpad] Step apply failed inside .command() shadow chain:", e);
          }
        });
        if (tr2.selectionSet) {
          const mappedSelection = tr2.selection.map(
            localTr.doc,
            localTr.mapping.slice(stepCountBefore)
          );
          localTr.setSelection(mappedSelection);
        }
      },

      view: this.view,
      editor: this.editor,
    });

    if (success) {
      this.merge(localTr);
      this.executionLog.push({
        command: label,
        status: "✅ Success",
        duration: "N/A",
      });
    } else {
      this.allSuccessful = false;
      this.executionLog.push({
        command: label,
        status: "❌ Rejected",
        duration: "N/A",
      });
    }

    return this as unknown as ChainedCommands;
  }

  public run(): boolean {
    if (this.shouldDispatch && this.executionLog.length > 0) {
      console.group("🚀 Arkpad Shadow Engine Refinement Log");
      console.table(this.executionLog);
      console.groupEnd();
    }

    if (!this.allSuccessful) {
      if (this.shouldDispatch) {
        console.warn("[Arkpad] Shadow Engine execution failed. Log:", this.executionLog);
      }
      return false;
    }

    if (this.shouldDispatch && this.dispatch) {
      try {
        this.dispatch(this.masterTransaction);
        return true;
      } catch (e) {
        console.error("[Arkpad] Final shadow dispatch failed:", e);
        return false;
      }
    }

    return true;
  }
}

/**
 * Type-safe export for CommandManager.
 */
export const CommandManager = CommandManagerInstance as unknown as {
  new (options: {
    state: EditorState;
    commands: ArkpadCommandRegistry;
    view?: EditorView;
    dispatch?: (tr: Transaction) => void;
    shouldDispatch?: boolean;
    schema: Schema;
    editor: ArkpadEditorAPI;
  }): CommandManagerInstance & ChainedCommands;
};

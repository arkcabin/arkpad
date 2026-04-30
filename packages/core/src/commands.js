import { TextSelection } from "prosemirror-state";
import { Slice } from "prosemirror-model";
import { parseContent } from "./utils";
/**
 * CommandManager handles the chaining of commands in a single transaction.
 */
export class CommandManager {
    state;
    transaction;
    view;
    commands;
    dispatch;
    shouldDispatch;
    schema;
    callbacks = [];
    constructor(options) {
        this.state = options.state;
        this.commands = options.commands;
        this.view = options.view;
        this.dispatch = options.dispatch;
        this.shouldDispatch = options.shouldDispatch ?? true;
        this.transaction = this.state.tr;
        this.schema = options.schema;
        // Build the proxy to allow calling commands as methods
        return new Proxy(this, {
            get: (target, prop) => {
                if (prop in target) {
                    return target[prop];
                }
                const command = this.commands[prop];
                if (!command) {
                    return undefined;
                }
                return (...args) => {
                    this.callbacks.push(({ state, tr, view }) => {
                        const result = command(...args);
                        if (typeof result === "function") {
                            // Arkpad commands usually take a single 'props' object.
                            // Prosemirror commands take (state, dispatch, view).
                            // We check the function length to decide, or just pass both if it's an Arkpad thunk.
                            const dispatchFn = (tr2) => {
                                // If the command dispatches, we merge its steps into our master transaction
                                tr2.steps.forEach((step) => tr.step(step));
                            };
                            if (result.length <= 1) {
                                return result({
                                    state,
                                    dispatch: dispatchFn,
                                    view,
                                    tr,
                                });
                            }
                            return result(state, dispatchFn, view);
                        }
                        return !!result;
                    });
                    return this;
                };
            },
        });
    }
    focus(position) {
        this.callbacks.push(({ tr }) => {
            if (this.view) {
                this.view.focus();
            }
            if (position === undefined || position === null) {
                return true;
            }
            let selection;
            if (position === "start") {
                selection = TextSelection.create(tr.doc, 0);
            }
            else if (position === "end") {
                selection = TextSelection.create(tr.doc, tr.doc.content.size);
            }
            else {
                const pos = Math.max(0, Math.min(position, tr.doc.content.size));
                selection = TextSelection.create(tr.doc, pos);
            }
            tr.setSelection(selection);
            return true;
        });
        return this;
    }
    insertContent(content, format) {
        this.callbacks.push(({ tr }) => {
            const parsedDoc = parseContent(content, this.schema, format);
            const slice = new Slice(parsedDoc.content, 0, 0);
            tr.replaceSelection(slice);
            return true;
        });
        return this;
    }
    scrollIntoView() {
        this.callbacks.push(({ tr }) => {
            tr.scrollIntoView();
            return true;
        });
        return this;
    }
    setMeta(key, value) {
        this.callbacks.push(({ tr }) => {
            tr.setMeta(key, value);
            return true;
        });
        return this;
    }
    command(fn) {
        this.callbacks.push(({ state, tr, view }) => {
            return fn({ state, tr, view });
        });
        return this;
    }
    run() {
        let currentState = this.state;
        const tr = this.transaction;
        let allSuccessful = true;
        let lastStepCount = 0;
        // Fast Path: If only one callback, skip state application loop
        if (this.callbacks.length === 1) {
            try {
                const success = this.callbacks[0]({ state: currentState, tr, view: this.view });
                if (success && this.shouldDispatch && this.dispatch) {
                    this.dispatch(tr);
                }
                return success;
            }
            catch {
                return false;
            }
        }
        for (const callback of this.callbacks) {
            // Execute callback with the latest state
            let success;
            try {
                success = callback({ state: currentState, tr, view: this.view });
            }
            catch {
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
                }
                catch {
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

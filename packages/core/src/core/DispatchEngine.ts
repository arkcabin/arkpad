import { Transaction } from "prosemirror-state";
import { IArkpadEditor, InterceptorConfig, AsyncInterceptor } from "../api";
import { HookManager } from "./HookManager";
import { Governance } from "./Governance";

declare const process: any;

export class DispatchEngine {
  public transactionQueue: Transaction[] = [];
  public isDispatching = false;
  public documentVersion = 0;
  public isPending = false;
  public dispatchTimeout = 500;

  constructor(
    private editor: IArkpadEditor,
    private hooks: HookManager,
    private interceptors: InterceptorConfig[],
    private asyncInterceptors: AsyncInterceptor[]
  ) {}

  public dispatch(transaction: Transaction): void {
    if (this.isDispatching) {
      this.transactionQueue.push(transaction);
      return;
    }
    this.processQueue(transaction);
  }

  private async processQueue(initialTr: Transaction) {
    this.isDispatching = true;
    let nextTr: Transaction | undefined = initialTr;

    try {
      while (nextTr) {
        let tr = nextTr;
        this.editor.events.emit("transaction:pre", { editor: this.editor, transaction: tr });

        // 3. Async Middleware (Agentic Approval) - Fire and forget for performance
        if (this.asyncInterceptors.length > 0) {
          this.runMiddleware(tr);
        }

        let blocked = false;
        for (const config of this.interceptors) {
          if (config.on === "docChanged" && !tr.docChanged) continue;
          if (config.on === "selectionChanged" && !tr.selectionSet) continue;
          const intercepted = config.handler({ editor: this.editor, transaction: tr });
          if (intercepted === false || intercepted === null) {
            blocked = true;
            break;
          }
          if (intercepted instanceof Transaction) tr = intercepted;
        }

        if (!blocked) this.commit(tr);

        const queuedTr = this.transactionQueue.shift();
        if (queuedTr) {
          const rebasedTr = this.editor.getView().state.tr;
          const mapping = tr.mapping;
          queuedTr.steps.forEach((step) => {
            const rebasedStep = step.map(mapping);
            if (rebasedStep) rebasedTr.step(rebasedStep);
          });
          if (queuedTr.selectionSet) {
            rebasedTr.setSelection(queuedTr.selection.map(rebasedTr.doc, mapping));
          }
          nextTr = rebasedTr;
        } else {
          nextTr = undefined;
        }
      }
    } finally {
      this.isDispatching = false;
    }
  }

  private async runMiddleware(tr: Transaction): Promise<Transaction | boolean | null> {
    this.isPending = true;
    this.editor.events.emit("dispatch:pending", { editor: this.editor, isPending: true });

    try {
      const middlewarePromise = (async () => {
        let currentTr = tr;
        for (const interceptor of this.asyncInterceptors) {
          const result = await interceptor({ editor: this.editor, transaction: currentTr });
          if (result === false || result === null) return null;
          if (result instanceof Transaction) currentTr = result;
        }
        return currentTr;
      })();

      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), this.dispatchTimeout)
      );

      const result = await Promise.race([middlewarePromise, timeoutPromise]);
      if (result === null) console.warn("[Arkpad] Async middleware timed out or blocked.");
      return result;
    } finally {
      this.isPending = false;
      this.editor.events.emit("dispatch:pending", { editor: this.editor, isPending: false });
    }
  }

  private commit(tr: Transaction) {
    const view = this.editor.getView();

    if (tr.docChanged && typeof process !== "undefined" && process.env.NODE_ENV === "development") {
      this.runGovernanceSentinel(tr);
    }

    this.hooks.triggerTransaction(tr);
    this.editor.events.emit("transaction", { editor: this.editor, transaction: tr });
    if (tr.docChanged)
      this.editor.events.emit("transaction:doc", { editor: this.editor, transaction: tr });

    if (tr.selectionSet) {
      const { from } = tr.selection;
      const node = (tr.selection as any).node || tr.selection.$from.parent;
      this.editor.events.emit("selection", {
        editor: this.editor,
        transaction: tr,
        node,
        pos: from,
        coords: this.editor.getCoords(from),
      });
      this.hooks.triggerSelection(tr, node, from);
    }

    const nextState = view.state.apply(tr);
    view.updateState(nextState);
    this.documentVersion++;

    this.hooks.triggerUpdate();
    this.editor.extensionManager.menuEngine?.update(view, undefined);
    this.editor.emitUpdate(nextState);
  }

  private runGovernanceSentinel(tr: Transaction) {
    try {
      tr.steps.forEach((_step, index) => {
        const map = tr.mapping.maps[index];
        if (!map) return;
        map.forEach((_os, _oe, ns, ne) => {
          tr.doc.nodesBetween(ns, ne, (node, pos, parent) => {
            if (parent) {
              const parentRole = Governance.resolveRole(parent);
              const childRole = Governance.resolveRole(node);
              const mask = (parent.type.spec as any).allowedRoles;
              if (!Governance.canAccept(parentRole, childRole, mask)) {
                console.warn(
                  `[Arkpad Governance] Invalid nesting at ${pos}: ${node.type.name} in ${parent.type.name}`
                );
              }
            }
            return true;
          });
        });
      });
    } catch (e) {
      console.error("[Arkpad Governance] Sentinel error:", e);
    }
  }
}

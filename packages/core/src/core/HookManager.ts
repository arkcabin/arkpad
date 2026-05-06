import { Transaction } from "prosemirror-state";
import { IArkpadEditor, ArkpadExtension } from "../api";

/**
 * Manages the indexing and execution of extension hooks and native event listeners.
 */
export class HookManager {
  public transactionHooks: ArkpadExtension[] = [];
  public selectionHooks: ArkpadExtension[] = [];
  public updateHooks: ArkpadExtension[] = [];
  public destroyHooks: ArkpadExtension[] = [];

  public eventHooks = {
    onClick: [] as ArkpadExtension[],
    onDoubleClick: [] as ArkpadExtension[],
    onKeyDown: [] as ArkpadExtension[],
    onDrop: [] as ArkpadExtension[],
    onPaste: [] as ArkpadExtension[],
    onFocus: [] as ArkpadExtension[],
    onBlur: [] as ArkpadExtension[],
  };

  constructor(private editor: IArkpadEditor) {}

  /**
   * Scans extensions and indexes their hooks for O(1) execution.
   */
  public indexHooks(extensions: ArkpadExtension[]) {
    this.transactionHooks = [];
    this.selectionHooks = [];
    this.updateHooks = [];
    this.destroyHooks = [];
    this.resetEventHooks();

    extensions.forEach((ext) => {
      if (ext.onTransaction) this.transactionHooks.push(ext);
      if (ext.onSelection) this.selectionHooks.push(ext);
      if (ext.onUpdate) this.updateHooks.push(ext);
      if (ext.onDestroy) this.destroyHooks.push(ext);

      if (ext.onClick) this.eventHooks.onClick.push(ext);
      if (ext.onDoubleClick) this.eventHooks.onDoubleClick.push(ext);
      if (ext.onKeyDown) this.eventHooks.onKeyDown.push(ext);
      if (ext.onDrop) this.eventHooks.onDrop.push(ext);
      if (ext.onPaste) this.eventHooks.onPaste.push(ext);
      if (ext.onFocus) this.eventHooks.onFocus.push(ext);
      if (ext.onBlur) this.eventHooks.onBlur.push(ext);
    });
  }

  private resetEventHooks() {
    this.eventHooks = {
      onClick: [],
      onDoubleClick: [],
      onKeyDown: [],
      onDrop: [],
      onPaste: [],
      onFocus: [],
      onBlur: [],
    };
  }

  public triggerTransaction(tr: Transaction) {
    for (const ext of this.transactionHooks) {
      ext.onTransaction!({ editor: this.editor, transaction: tr });
    }
  }

  public triggerSelection(tr: Transaction, node: any, pos: number) {
    for (const ext of this.selectionHooks) {
      ext.onSelection!({ editor: this.editor, transaction: tr, node, pos });
    }
  }

  public triggerUpdate() {
    for (const ext of this.updateHooks) {
      ext.onUpdate!({ editor: this.editor });
    }
  }

  public triggerDestroy() {
    for (const ext of this.destroyHooks) {
      ext.onDestroy?.();
    }
  }
}

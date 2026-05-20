import { EventEmitter } from "./EventEmitter";

/**
 * A reactive storage service for Arkpad extensions.
 * Emits events when storage values change, enabling real-time UI updates.
 */
export class Storage {
  private events: EventEmitter;
  private data = new Map<string, Record<string, any>>();

  constructor(events: EventEmitter) {
    this.events = events;
  }

  /**
   * Set a storage value for a specific extension.
   */
  set(extensionName: string, key: string, value: any, silent = false): void {
    if (!this.data.has(extensionName)) {
      this.data.set(extensionName, {});
    }

    const extensionData = this.data.get(extensionName)!;
    const previousValue = extensionData[key];

    extensionData[key] = value;

    if (silent) return;

    // Emit reactive event
    this.events.emit("storage:update", {
      extensionName,
      key,
      value,
      previousValue,
    });
  }

  /**
   * Get a storage value for a specific extension.
   */
  get(extensionName: string, key: string): any {
    const extensionData = this.data.get(extensionName);
    return extensionData ? extensionData[key] : undefined;
  }

  /**
   * Get all storage values for a specific extension.
   */
  getAll(extensionName: string): Record<string, any> | undefined {
    return this.data.get(extensionName);
  }

  /**
   * Clear storage for a specific extension.
   */
  clear(extensionName: string): void {
    this.data.delete(extensionName);
    this.events.emit("storage:clear", { extensionName });
  }
}

/**
 * A lightweight, instance-based event emitter for the Arkpad Core.
 * Allows the editor to communicate with extensions and UI components
 * without being tightly coupled.
 */
export class EventEmitter {
  private callbacks: Record<string, Function[]> = {};

  /**
   * Subscribe to an event.
   */
  on(event: string, callback: Function): this {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }

    this.callbacks[event].push(callback);

    return this;
  }

  /**
   * Unsubscribe from an event.
   */
  off(event: string, callback: Function): this {
    if (!this.callbacks[event]) {
      return this;
    }

    this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback);

    return this;
  }

  /**
   * Emit an event.
   */
  emit(event: string, ...args: any[]): this {
    if (!this.callbacks[event]) {
      return this;
    }

    this.callbacks[event].forEach((callback) => {
      callback(...args);
    });

    return this;
  }

  /**
   * Subscribe to an event once.
   */
  once(event: string, callback: Function): this {
    const on = (...args: any[]) => {
      this.off(event, on);
      callback(...args);
    };

    return this.on(event, on);
  }

  /**
   * Remove all listeners for a specific event or all events.
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.callbacks[event] = [];
    } else {
      this.callbacks = {};
    }

    return this;
  }
}

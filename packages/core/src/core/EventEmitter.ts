/**
 * A lightweight, instance-based event emitter for the Arkpad Core.
 * Allows the editor to communicate with extensions and UI components
 * without being tightly coupled.
 */
export class EventEmitter {
  private callbacks: Record<string, ((...args: any[]) => void)[]> = {};

  /**
   * Subscribe to an event.
   */
  on(event: string, callback: (...args: any[]) => void): this {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }

    this.callbacks[event].push(callback);

    return this;
  }

  /**
   * Unsubscribe from an event.
   */
  off(event: string, callback: (...args: any[]) => void): this {
    if (!this.callbacks[event]) {
      return this;
    }

    this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback);

    return this;
  }

  /**
   * Emit an event.
   * Supports hierarchical "Pulse" emissions (e.g., emitting "selection:update"
   * also triggers listeners for "selection").
   */
  emit(event: string, ...args: any[]): this {
    // 1. Trigger exact match
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((callback) => callback(...args));
    }

    // 2. Pulse: Trigger parent namespace if applicable
    if (event.includes(":")) {
      const parentEvent = event.split(":")[0]!;
      if (this.callbacks[parentEvent]) {
        this.callbacks[parentEvent].forEach((callback) => callback(...args));
      }
    }

    return this;
  }

  /**
   * Subscribe to an event once.
   */
  once(event: string, callback: (...args: any[]) => void): this {
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

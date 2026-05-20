import { IArkpadEditor } from "../api";

/**
 * A central registry for keyboard shortcuts.
 * Allows for dynamic remapping and collision detection.
 */
export class ShortcutRegistry {
  private editor: IArkpadEditor;
  private shortcuts = new Map<string, string>(); // Key -> Command Name

  constructor(editor: IArkpadEditor) {
    this.editor = editor;
  }

  /**
   * Register a new shortcut.
   */
  register(keys: string, commandName: string) {
    this.shortcuts.set(keys, commandName);
  }

  /**
   * Unregister a shortcut.
   */
  unregister(keys: string) {
    this.shortcuts.delete(keys);
  }

  /**
   * Get the command name for a specific key combination.
   */
  getCommand(keys: string): string | undefined {
    return this.shortcuts.get(keys);
  }

  /**
   * Returns all registered shortcuts as a JSON object.
   */
  getAll(): Record<string, string> {
    const result: Record<string, string> = {};
    this.shortcuts.forEach((cmd, keys) => {
      result[keys] = cmd;
    });
    return result;
  }
}

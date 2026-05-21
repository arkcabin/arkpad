import { BlockConfig } from "./types";

export class BlockRegistryStore {
  private blocks = new Map<string, BlockConfig>();

  /**
   * Registers a new block template into the builder catalog.
   */
  public register(config: BlockConfig): void {
    this.blocks.set(config.type, config);
  }

  /**
   * Registers multiple block templates.
   */
  public registerAll(configs: BlockConfig[]): void {
    configs.forEach((config) => this.register(config));
  }

  /**
   * Retrieves a specific block configuration by its type slug.
   */
  public get(type: string): BlockConfig | undefined {
    return this.blocks.get(type);
  }

  /**
   * Returns a list of all registered block configurations.
   */
  public getAll(): BlockConfig[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Clears all registered blocks.
   */
  public clear(): void {
    this.blocks.clear();
  }
}

// Export a global singleton instance of the registry for easy access
export const blockRegistry = new BlockRegistryStore();
export default blockRegistry;

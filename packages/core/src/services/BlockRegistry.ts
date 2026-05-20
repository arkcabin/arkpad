import { IBlockRegistry, BlockDefinition, BlockCategory } from "../api";

/**
 * BlockRegistry handles the registration and discovery of blocks for the Page Builder.
 * It allows extensions to register custom blocks that can be discovered by the UI.
 */
export class BlockRegistry implements IBlockRegistry {
  private blocks = new Map<string, BlockDefinition>();

  public registerBlock(definition: BlockDefinition): void {
    if (this.blocks.has(definition.type)) {
      console.warn(
        `[BlockRegistry] Block type "${definition.type}" is already registered. Overwriting.`
      );
    }
    this.blocks.set(definition.type, definition);
  }

  public unregisterBlock(type: string): void {
    this.blocks.delete(type);
  }

  public getBlock(type: string): BlockDefinition | undefined {
    return this.blocks.get(type);
  }

  public getBlocksByCategory(category: BlockCategory): BlockDefinition[] {
    return Array.from(this.blocks.values()).filter((block) => block.category === category);
  }

  public getAllBlocks(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  public searchBlocks(query: string): BlockDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.blocks.values()).filter(
      (block) =>
        block.label.toLowerCase().includes(lowerQuery) ||
        block.type.toLowerCase().includes(lowerQuery)
    );
  }
}

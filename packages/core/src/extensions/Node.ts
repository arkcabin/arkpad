import { NodeConfig } from "../types";
import { Extension } from "./Extension";

/**
 * The Node class is a specialized Extension for ProseMirror nodes.
 */
export class Node<Options = any, Storage = any> extends Extension<Options, Storage> {
  public config: NodeConfig<Options, Storage>;

  constructor(config: NodeConfig<Options, Storage>, parent?: Extension) {
    super(config, parent);
    this.config = config;
  }

  /**
   * Static factory to create a new node.
   */
  static create<O = any, S = any>(config: NodeConfig<O, S>): Node<O, S> {
    return new Node<O, S>(config);
  }

  /**
   * Configures the node with custom options.
   */
  configure(options: Partial<Options>): Node<Options, Storage> {
    return super.configure(options) as Node<Options, Storage>;
  }

  /**
   * Creates a new node by extending an existing one.
   */
  extend<O = Options, S = Storage>(config: Partial<NodeConfig<O, S>>): Node<O, S> {
    return super.extend(config as any) as Node<O, S>;
  }
}

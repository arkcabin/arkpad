import { MarkConfig } from "../types";
import { Extension } from "./Extension";

/**
 * The Mark class is a specialized Extension for ProseMirror marks.
 */
export class Mark<Options = any, Storage = any> extends Extension<Options, Storage> {
  public config: MarkConfig<Options, Storage>;

  constructor(config: MarkConfig<Options, Storage>, parent?: Extension) {
    super(config, parent);
    this.config = config;
  }

  /**
   * Static factory to create a new mark.
   */
  static create<O = any, S = any>(config: MarkConfig<O, S>): Mark<O, S> {
    return new Mark<O, S>(config);
  }

  /**
   * Configures the mark with custom options.
   */
  configure(options: Partial<Options>): Mark<Options, Storage> {
    return super.configure(options) as Mark<Options, Storage>;
  }

  /**
   * Creates a new mark by extending an existing one.
   */
  extend<O = Options, S = Storage>(config: Partial<MarkConfig<O, S>>): Mark<O, S> {
    return super.extend(config as any) as Mark<O, S>;
  }
}

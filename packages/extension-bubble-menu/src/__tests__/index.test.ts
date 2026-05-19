import { describe, it, expect } from "vitest";
import { BubbleMenu } from "../index";

describe("BubbleMenu", () => {
  it("extension is defined and has correct name", () => {
    expect(BubbleMenu).toBeDefined();
    expect(BubbleMenu.name).toBe("bubbleMenu");
  });

  it("registers options and sets shouldShow to undefined by default", () => {
    const opts = (BubbleMenu as any).config.addOptions();
    expect(opts).toBeDefined();
    expect(opts.shouldShow).toBeUndefined();
  });

  it("defines standard menu specification for zero-flicker bubble positioning", () => {
    const menuSpec = (BubbleMenu as any).config.addMenu.call({
      options: { shouldShow: undefined },
    });
    expect(menuSpec).toBeDefined();
    expect(menuSpec.type).toBe("bubble");
    expect(menuSpec.priority).toBe(100);
    expect(menuSpec.shouldShow).toBeTypeOf("function");
  });
});

import { describe, it, expect } from "vitest";
import { FloatingMenu } from "../index";

describe("FloatingMenu", () => {
  it("extension is defined and has correct name", () => {
    expect(FloatingMenu).toBeDefined();
    expect(FloatingMenu.name).toBe("floatingMenu");
  });

  it("registers options and sets shouldShow to undefined by default", () => {
    const opts = (FloatingMenu as any).config.addOptions();
    expect(opts).toBeDefined();
    expect(opts.shouldShow).toBeUndefined();
  });

  it("defines standard menu specification for zero-flicker floating positioning", () => {
    const menuSpec = (FloatingMenu as any).config.addMenu.call({
      options: { shouldShow: undefined },
    });
    expect(menuSpec).toBeDefined();
    expect(menuSpec.type).toBe("floating");
    expect(menuSpec.priority).toBe(100);
    expect(menuSpec.shouldShow).toBeTypeOf("function");
  });
});

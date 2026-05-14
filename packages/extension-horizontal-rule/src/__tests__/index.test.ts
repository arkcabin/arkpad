import { describe, it, expect } from "vitest";
import { HorizontalRule } from "../index";

describe("HorizontalRule", () => {
  it("extension is defined", () => {
    expect(HorizontalRule).toBeDefined();
    expect(HorizontalRule.name).toBe("horizontalRule");
  });

  it("parseHTML rules exist", () => {
    const rules = HorizontalRule.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (HorizontalRule.addCommands) {
    it("registers commands", () => {
      expect(HorizontalRule.addCommands?.()).toBeDefined();
    });
  }
});
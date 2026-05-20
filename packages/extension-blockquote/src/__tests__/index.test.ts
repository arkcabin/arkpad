import { describe, it, expect } from "vitest";
import { Blockquote } from "../index";

describe("Blockquote", () => {
  it("extension is defined", () => {
    expect(Blockquote).toBeDefined();
    expect(Blockquote.name).toBe("blockquote");
  });

  it("parseHTML rules exist", () => {
    const rules = Blockquote.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (Blockquote.addCommands) {
    it("registers commands", () => {
      expect(Blockquote.addCommands?.()).toBeDefined();
    });
  }
});

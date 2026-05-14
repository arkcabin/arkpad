import { describe, it, expect } from "vitest";
import { BulletList } from "../index";

describe("BulletList", () => {
  it("extension is defined", () => {
    expect(BulletList).toBeDefined();
    expect(BulletList.name).toBe("bulletList");
  });

  it("parseHTML rules exist", () => {
    const rules = BulletList.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (BulletList.addCommands) {
    it("registers commands", () => {
      expect(BulletList.addCommands?.()).toBeDefined();
    });
  }
});
import { describe, it, expect } from "vitest";
import { Heading } from "../index";

describe("Heading", () => {
  it("extension is defined", () => {
    expect(Heading).toBeDefined();
    expect(Heading.name).toBe("heading");
  });

  it("parseHTML rules exist", () => {
    const rules = Heading.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (Heading.addCommands) {
    it("registers commands", () => {
      expect(Heading.addCommands?.()).toBeDefined();
    });
  }
});
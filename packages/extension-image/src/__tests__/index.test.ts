import { describe, it, expect } from "vitest";
import { Image } from "../index";

describe("Image", () => {
  it("extension is defined", () => {
    expect(Image).toBeDefined();
    expect(Image.name).toBe("image");
  });

  it("parseHTML rules exist", () => {
    const rules = Image.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (Image.addCommands) {
    it("registers commands", () => {
      expect(Image.addCommands?.()).toBeDefined();
    });
  }
});
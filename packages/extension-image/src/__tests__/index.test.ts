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

  it("registers layout role as WIDGET", () => {
    expect((Image as any).config.role).toBe(4);
  });

  it("registers custom node view constructor", () => {
    expect((Image as any).config.addNodeView).toBeDefined();
  });
});

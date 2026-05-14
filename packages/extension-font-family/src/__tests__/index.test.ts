import { describe, it, expect } from "vitest";
import { FontFamily } from "../index";

describe("FontFamily", () => {
  it("extension is defined", () => {
    expect(FontFamily).toBeDefined();
    expect(FontFamily.name).toBe("fontFamily");
  });

  it("renderHTML returns span tag", () => {
    const result = FontFamily.renderHTML({ node: {} as any, HTMLAttributes: { style: "fontFamily: blue" } });
    expect(result[0]).toBe("span");
  });

  it("addAttributes produces correct HTML attributes", () => {
    const attrs = FontFamily.addAttributes?.();
    expect(attrs).toBeDefined();
    expect((attrs as any)["fontFamily"].default).toBeNull();
  });

  it("parseHTML rules exist for style matching", () => {
    const rules = FontFamily.parseHTML();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0].style).toBe("font-family");
  });

  if (FontFamily.addCommands) {
    it("registers commands", () => {
      expect(FontFamily.addCommands?.()).toBeDefined();
    });
  }
});
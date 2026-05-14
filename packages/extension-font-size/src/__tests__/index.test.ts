import { describe, it, expect } from "vitest";
import { FontSize } from "../index";

describe("FontSize", () => {
  it("extension is defined", () => {
    expect(FontSize).toBeDefined();
    expect(FontSize.name).toBe("fontSize");
  });

  it("renderHTML returns span tag", () => {
    const result = FontSize.renderHTML({ node: {} as any, HTMLAttributes: { style: "fontSize: blue" } });
    expect(result[0]).toBe("span");
  });

  it("addAttributes produces correct HTML attributes", () => {
    const attrs = FontSize.addAttributes?.();
    expect(attrs).toBeDefined();
    expect((attrs as any)["fontSize"].default).toBeNull();
  });

  it("parseHTML rules exist for style matching", () => {
    const rules = FontSize.parseHTML();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0].style).toBe("font-size");
  });

  if (FontSize.addCommands) {
    it("registers commands", () => {
      expect(FontSize.addCommands?.()).toBeDefined();
    });
  }
});
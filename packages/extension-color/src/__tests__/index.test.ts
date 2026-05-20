import { describe, it, expect } from "vitest";
import { Color } from "../index";

describe("Color", () => {
  it("extension is defined", () => {
    expect(Color).toBeDefined();
    expect(Color.name).toBe("color");
  });

  it("renderHTML returns span tag", () => {
    const result = Color.renderHTML({ node: {} as any, HTMLAttributes: { style: "color: blue" } });
    expect(result[0]).toBe("span");
  });

  it("addAttributes produces correct HTML attributes", () => {
    const attrs = Color.addAttributes?.();
    expect(attrs).toBeDefined();
    expect((attrs as any)["color"].default).toBeNull();
  });

  it("parseHTML rules exist for style matching", () => {
    const rules = Color.parseHTML();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules[0].style).toBe("color");
  });

  if (Color.addCommands) {
    it("registers commands", () => {
      expect(Color.addCommands?.()).toBeDefined();
    });
  }
});

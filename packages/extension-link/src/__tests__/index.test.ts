import { describe, it, expect } from "vitest";
import { Link } from "../index";

describe("Link", () => {
  it("extension is defined", () => {
    expect(Link).toBeDefined();
    expect(Link.name).toBe("link");
  });

  it("registers commands", () => {
    const cmds = Link.addCommands?.();
    expect(cmds).toBeDefined();
    if (cmds) expect(cmds).toHaveProperty("setLink");
  });

  it("registers keyboard shortcuts", () => {
    const shortcuts = Link.addKeyboardShortcuts?.();
    expect(shortcuts).toBeDefined();
  });
});

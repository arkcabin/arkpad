import { describe, it, expect } from "vitest";
import { CodeBlock } from "../index";

describe("CodeBlock", () => {
  it("extension is defined", () => {
    expect(CodeBlock).toBeDefined();
    expect(CodeBlock.name).toBe("codeBlock");
  });

  it("parseHTML rules exist", () => {
    const rules = CodeBlock.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (CodeBlock.addCommands) {
    it("registers commands", () => {
      expect(CodeBlock.addCommands?.()).toBeDefined();
    });
  }
});
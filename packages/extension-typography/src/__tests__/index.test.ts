import { describe, it, expect } from "vitest";
import { Typography } from "../index";

describe("Typography", () => {
  it("extension is defined", () => {
    expect(Typography).toBeDefined();
    expect(Typography.name).toBe("typography");
  });

  it("registers input rules for all replacements", () => {
    const rules = Typography.addInputRules?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBe(15);
  });

  it("registers ProseMirror plugin for smart quotes", () => {
    const plugins = Typography.addProseMirrorPlugins?.();
    expect(plugins).toBeDefined();
    expect(plugins!.length).toBe(1);
  });
});

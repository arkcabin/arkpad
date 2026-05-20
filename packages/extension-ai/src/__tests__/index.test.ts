import { describe, it, expect } from "vitest";
import { AI } from "../index";

describe("AI Extension", () => {
  it("extension is defined", () => {
    expect(AI).toBeDefined();
    expect(AI.name).toBe("ai");
  });

  it("registers commands", () => {
    const cmds = AI.addCommands?.();
    expect(cmds).toBeDefined();
    expect(cmds?.aiComplete).toBeDefined();
    expect(cmds?.aiSummarize).toBeDefined();
  });

  it("initializes storage state", () => {
    const storage = AI.config.addStorage?.call(AI.createContext());
    expect(storage).toBeDefined();
    expect(storage?.isGenerating).toBe(false);
    expect(storage?.lastError).toBeNull();
  });

  it("respects default options", () => {
    const options = AI.config.addOptions?.call(AI.createContext());
    expect(options).toBeDefined();
    expect(options?.enableInterceptor).toBe(true);
  });
});

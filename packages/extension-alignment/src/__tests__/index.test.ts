import { describe, it, expect } from "vitest";
import { createTextAlign } from "../index";

describe("TextAlign", () => {
  it("creates extension with correct name and commands", () => {
    const ext = createTextAlign();
    expect(ext).toBeDefined();
    expect(ext.name).toBe("textAlign");
    expect(ext.addCommands).toBeDefined();
  });
});

import { describe, it, expect } from "vitest";
import { Placeholder } from "@arkpad/core";

describe("Placeholder", () => {
  it("extension is defined and named", () => {
    expect(Placeholder).toBeDefined();
    expect(Placeholder.name).toBe("placeholder");
  });

  it("configures options", () => {
    const configured = Placeholder.configure({ placeholder: "Write..." });
    expect(configured.options.placeholder).toBe("Write...");
  });
});

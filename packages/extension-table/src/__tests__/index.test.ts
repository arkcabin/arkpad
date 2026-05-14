import { describe, it, expect } from "vitest";
import { Table } from "../index";

describe("Table", () => {
  it("extension is defined", () => {
    expect(Table).toBeDefined();
    expect(Table.name).toBe("table");
  });

  it("parseHTML rules exist", () => {
    const rules = Table.parseHTML?.();
    expect(rules).toBeDefined();
  });

  if (Table.addCommands) {
    it("registers commands", () => {
      expect(Table.addCommands?.()).toBeDefined();
    });
  }
});
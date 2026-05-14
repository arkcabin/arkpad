import { describe, it, expect } from "vitest";
import { OrderedList } from "../index";

describe("OrderedList", () => {
  it("extension is defined", () => {
    expect(OrderedList).toBeDefined();
    expect(OrderedList.name).toBe("orderedList");
  });

  it("parseHTML rules exist", () => {
    const rules = OrderedList.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (OrderedList.addCommands) {
    it("registers commands", () => {
      expect(OrderedList.addCommands?.()).toBeDefined();
    });
  }
});
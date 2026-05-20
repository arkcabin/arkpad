import { describe, it, expect } from "vitest";
import { ListItem } from "../index";

describe("ListItem", () => {
  it("extension is defined", () => {
    expect(ListItem).toBeDefined();
    expect(ListItem.name).toBe("listItem");
  });

  it("parseHTML rules exist", () => {
    const rules = ListItem.parseHTML?.();
    expect(rules).toBeDefined();
  });

  if (ListItem.addCommands) {
    it("registers commands", () => {
      expect(ListItem.addCommands?.()).toBeDefined();
    });
  }
});

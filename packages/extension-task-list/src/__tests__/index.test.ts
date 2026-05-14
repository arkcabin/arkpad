import { describe, it, expect } from "vitest";
import { TaskList } from "../index";

describe("TaskList", () => {
  it("extension is defined", () => {
    expect(TaskList).toBeDefined();
    expect(TaskList.name).toBe("taskList");
  });

  it("parseHTML rules exist", () => {
    const rules = TaskList.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBeGreaterThan(0);
  });

  if (TaskList.addCommands) {
    it("registers commands", () => {
      expect(TaskList.addCommands?.()).toBeDefined();
    });
  }
});
import { describe, it, expect } from "vitest";
import { Extension } from "../sdk/Extension";

describe("Extension", () => {
  it("creates an extension with name and config", () => {
    const ext = Extension.create({ name: "testExt" });
    expect(ext.name).toBe("testExt");
  });

  it("applies options via configure()", () => {
    const ext = Extension.create({
      name: "configurable",
      addOptions() {
        return { value: 1 };
      },
    });
    const configured = ext.configure({ value: 2 });
    expect(configured.options.value).toBe(2);
  });

  it("inherits default options when configure is partial", () => {
    const ext = Extension.create({
      name: "partial",
      addOptions() {
        return { a: 1, b: 2 };
      },
    });
    const configured = ext.configure({ a: 10 });
    expect(configured.options.a).toBe(10);
    expect(configured.options.b).toBe(2);
  });

  it("merges addExtensions() from nested extensions", () => {
    const inner = Extension.create({ name: "inner" });
    const outer = Extension.create({
      name: "outer",
      addExtensions() {
        return [inner];
      },
    });
    const exts = outer.addExtensions?.();
    expect(exts).toHaveLength(1);
    expect(exts![0].name).toBe("inner");
  });

  it("registers commands via addCommands", () => {
    const ext = Extension.create({
      name: "cmdExt",
      addCommands() {
        return {
          myCmd: () => () => true,
        };
      },
    });
    const cmds = ext.addCommands?.();
    expect(cmds).toHaveProperty("myCmd");
  });

  it("registers keyboard shortcuts via addKeyboardShortcuts", () => {
    const ext = Extension.create({
      name: "shortcutExt",
      addKeyboardShortcuts() {
        return { "Mod-s": () => true };
      },
    });
    const shortcuts = ext.addKeyboardShortcuts?.();
    expect(shortcuts).toHaveProperty("Mod-s");
  });
});

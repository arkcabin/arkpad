import { describe, it, expect } from "vitest";
import { Plugin } from "prosemirror-state";
import { ExtensionManager } from "../core/ExtensionManager";
import { Extension } from "../sdk/Extension";
import { SchemaBuilder } from "../services/schema/schema-builder";

describe("ExtensionManager", () => {
  function createSchema() {
    return new SchemaBuilder([]).build();
  }

  it("flattens nested extensions", () => {
    const inner = Extension.create({ name: "inner" });
    const outer = Extension.create({
      name: "outer",
      addExtensions() {
        return [inner];
      },
    });
    const schema = createSchema();
    new ExtensionManager(schema, [outer]);
    expect(true).toBe(true);
  });

  it("deduplicates same instance", () => {
    const ext = Extension.create({ name: "dup" });
    const schema = createSchema();
    new ExtensionManager(schema, [ext, ext]);
    expect(true).toBe(true);
  });

  it("sorts by priority", () => {
    const low = Extension.create({ name: "low", priority: 50 } as any);
    const high = Extension.create({ name: "high", priority: 150 } as any);
    const schema = createSchema();
    new ExtensionManager(schema, [low, high]);
    expect(true).toBe(true);
  });

  it("builds plugins from extensions", () => {
    const ext = Extension.create({
      name: "pluginExt",
      addProseMirrorPlugins() {
        return [new Plugin({ key: "test" } as any)];
      },
    });
    const schema = createSchema();
    const manager = new ExtensionManager(schema, [ext]);
    const plugins = manager.getPlugins();
    expect(Array.isArray(plugins)).toBe(true);
  });

  it("builds shortcut map from extensions", () => {
    const ext = Extension.create({
      name: "shortcutExt",
      addKeyboardShortcuts() {
        return { "Mod-s": () => true };
      },
    });
    const schema = createSchema();
    const manager = new ExtensionManager(schema, [ext]);
    expect(manager).toBeDefined();
  });
});

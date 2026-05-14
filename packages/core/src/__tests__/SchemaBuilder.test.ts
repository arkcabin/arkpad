import { describe, it, expect, beforeEach } from "vitest";
import { SchemaBuilder } from "../services/schema/schema-builder";
import { Extension } from "../sdk/Extension";
import { Node } from "../sdk/Node";
import { Mark } from "../sdk/Mark";

describe("SchemaBuilder", () => {
  beforeEach(() => {
    SchemaBuilder.clearCache();
  });

  it("builds a schema with default nodes (doc, paragraph, text)", () => {
    const builder = new SchemaBuilder([]);
    const schema = builder.build();
    expect(schema.nodes.doc).toBeDefined();
    expect(schema.nodes.paragraph).toBeDefined();
    expect(schema.nodes.text).toBeDefined();
  });

  it("registers a custom node extension", () => {
    const customNode = Node.create({ name: "customBlock", group: "block", content: "inline*" });
    const builder = new SchemaBuilder([customNode]);
    const schema = builder.build();
    expect(schema.nodes.customBlock).toBeDefined();
  });

  it("registers a custom mark extension", () => {
    const customMark = Mark.create({ name: "customMark" });
    const builder = new SchemaBuilder([customMark]);
    const schema = builder.build();
    expect(schema.marks.customMark).toBeDefined();
  });

  it("returns cached schema for same extension set", () => {
    const ext = Extension.create({ name: "test" });
    const builder1 = new SchemaBuilder([ext]);
    const builder2 = new SchemaBuilder([ext]);
    const schema1 = builder1.build();
    const schema2 = builder2.build();
    expect(schema1).toBe(schema2);
  });

  it("flattens nested extensions via addExtensions()", () => {
    const inner = Extension.create({ name: "inner" });
    const outer = Extension.create({
      name: "outer",
      addExtensions() { return [inner]; },
    });
    const builder = new SchemaBuilder([outer]);
    const schema = builder.build();
    // Should not throw - schema builds successfully
    expect(schema.nodes.doc).toBeDefined();
  });

  it("skips extension with invalid node name", () => {
    const invalid = Node.create({ name: "[object Object]" as any, group: "block" } as any);
    const builder = new SchemaBuilder([invalid]);
    const schema = builder.build();
    expect(schema.nodes.doc).toBeDefined();
  });

  it("skips text node registration (reserved)", () => {
    const textNode = Node.create({ name: "text" });
    const builder = new SchemaBuilder([textNode]);
    const schema = builder.build();
    expect(schema.nodes.text).toBeDefined();
  });

  it("processes node with role and group", () => {
    const roleNode = Node.create({ name: "layoutBlock", group: "block", role: 8, content: "block+" } as any);
    const builder = new SchemaBuilder([roleNode]);
    const schema = builder.build();
    expect(schema.nodes.layoutBlock).toBeDefined();
    const group = (schema.nodes.layoutBlock.spec as any).group;
    expect(group).toContain("block");
  });
});

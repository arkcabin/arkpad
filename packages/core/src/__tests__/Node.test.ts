import { describe, it, expect } from "vitest";
import { Node } from "../sdk/Node";

describe("Node SDK", () => {
  it("creates a node extension with name", () => {
    const node = Node.create({ name: "testNode", group: "block", content: "inline*" });
    expect(node.name).toBe("testNode");
  });

  it("sets content and group from config", () => {
    const node = Node.create({ name: "para", group: "block", content: "inline*" });
    expect((node as any).config.content).toBe("inline*");
    expect((node as any).config.group).toBe("block");
  });

  it("adds attributes via addAttributes", () => {
    const node = Node.create({
      name: "styled",
      addAttributes() {
        return { color: { default: "red" } };
      },
    } as any);
    const attrs = node.addAttributes?.();
    expect(attrs).toHaveProperty("color");
  });

  it("renders HTML via renderHTML", () => {
    const node = Node.create({
      name: "testNode",
      renderHTML({ HTMLAttributes }: any) {
        return ["div", HTMLAttributes, 0];
      },
    } as any);
    const result = (node as any).config.renderHTML({ HTMLAttributes: { class: "test" } });
    expect(result).toEqual(["div", { class: "test" }, 0]);
  });

  it("parses HTML via parseHTML", () => {
    const node = Node.create({
      name: "testNode",
      parseHTML() {
        return [{ tag: "div.test" }];
      },
    } as any);
    const rules = node.parseHTML?.();
    expect(rules).toHaveLength(1);
    expect(rules![0].tag).toBe("div.test");
  });
});

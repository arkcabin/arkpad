import { describe, it, expect } from "vitest";
import { Mark } from "../sdk/Mark";

describe("Mark SDK", () => {
  it("creates a mark extension with name", () => {
    const mark = Mark.create({ name: "testMark" });
    expect(mark.name).toBe("testMark");
  });

  it("sets inclusive/excludes from config", () => {
    const mark = Mark.create({ name: "testMark", inclusive: false, excludes: "_" } as any);
    expect((mark as any).config.inclusive).toBe(false);
    expect((mark as any).config.excludes).toBe("_");
  });

  it("adds attributes via addAttributes", () => {
    const mark = Mark.create({
      name: "styledMark",
      addAttributes() {
        return { color: { default: null } };
      },
    } as any);
    const attrs = mark.addAttributes?.();
    expect(attrs).toHaveProperty("color");
  });

  it("renders HTML via renderHTML", () => {
    const mark = Mark.create({
      name: "testMark",
      renderHTML({ HTMLAttributes }: any) {
        return ["span", HTMLAttributes, 0];
      },
    } as any);
    const result = (mark as any).config.renderHTML({ HTMLAttributes: { style: "color:red" } });
    expect(result).toEqual(["span", { style: "color:red" }, 0]);
  });

  it("parses HTML via parseHTML", () => {
    const mark = Mark.create({
      name: "testMark",
      parseHTML() {
        return [{ tag: "span" }, { style: "color", getAttrs: (v: string) => v && { color: v } }];
      },
    } as any);
    const rules = mark.parseHTML?.();
    expect(rules).toHaveLength(2);
    expect(rules![0].tag).toBe("span");
    expect(rules![1].style).toBe("color");
  });
});

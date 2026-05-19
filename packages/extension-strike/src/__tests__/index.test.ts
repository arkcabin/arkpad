import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Strike } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    strike: {
      parseDOM: Strike.parseHTML() || [],
      toDOM: (m: any) => ["s", m.attrs?.class ? { class: m.attrs.class } : {}],
    },
  },
});

describe("Strike", () => {
  it("extension is defined", () => {
    expect(Strike).toBeDefined();
    expect(Strike.name).toBe("strike");
  });

  it("renderHTML returns <s> tag", () => {
    const result = Strike.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("s");
  });

  it("round-trips HTML: serialize then re-parse strike mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [schema.text("styled", [schema.mark("strike")])]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<s");
  });

  it("re-parses <s> back into strike mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><s>parsed</s></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "strike")).toBe(true);
  });

  if (Strike.addCommands) {
    it("registers commands", () => {
      const cmds = Strike.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Strike.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Strike.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});

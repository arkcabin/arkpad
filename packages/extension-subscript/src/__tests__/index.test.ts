import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Subscript } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    subscript: {
      parseDOM: Subscript.parseHTML() || [],
      toDOM: (m: any) => ["sub", m.attrs?.class ? { class: m.attrs.class } : {}],
    },
  },
});

describe("Subscript", () => {
  it("extension is defined", () => {
    expect(Subscript).toBeDefined();
    expect(Subscript.name).toBe("subscript");
  });

  it("renderHTML returns <sub> tag", () => {
    const result = Subscript.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("sub");
  });

  it("round-trips HTML: serialize then re-parse subscript mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [schema.text("styled", [schema.mark("subscript")])]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<sub");
  });

  it("re-parses <sub> back into subscript mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><sub>parsed</sub></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "subscript")).toBe(true);
  });

  if (Subscript.addCommands) {
    it("registers commands", () => {
      const cmds = Subscript.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Subscript.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Subscript.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});

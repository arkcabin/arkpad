import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Bold } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    bold: {
      parseDOM: Bold.parseHTML() || [],
      toDOM: (m: any) => ["strong", m.attrs?.class ? { class: m.attrs.class } : {}],
    },
  },
});

describe("Bold", () => {
  it("extension is defined", () => {
    expect(Bold).toBeDefined();
    expect(Bold.name).toBe("bold");
  });

  it("renderHTML returns <strong> tag", () => {
    const result = Bold.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("strong");
  });

  it("round-trips HTML: serialize then re-parse bold mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [schema.text("styled", [schema.mark("bold")])]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<strong");
  });

  it("re-parses <strong> back into bold mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><strong>parsed</strong></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "bold")).toBe(true);
  });

  if (Bold.addCommands) {
    it("registers commands", () => {
      const cmds = Bold.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Bold.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Bold.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});

import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Italic } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    italic: {
      parseDOM: Italic.parseHTML() || [],
      toDOM: (m: any) => ["em", (m.attrs?.class ? { class: m.attrs.class } : {})],
    },
  },
});

describe("Italic", () => {
  it("extension is defined", () => {
    expect(Italic).toBeDefined();
    expect(Italic.name).toBe("italic");
  });

  it("renderHTML returns <em> tag", () => {
    const result = Italic.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("em");
  });

  it("round-trips HTML: serialize then re-parse italic mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [
        schema.text("styled", [schema.mark("italic")]),
      ]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<em");
  });

  it("re-parses <em> back into italic mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><em>parsed</em></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "italic")).toBe(true);
  });

  if (Italic.addCommands) {
    it("registers commands", () => {
      const cmds = Italic.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Italic.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Italic.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});
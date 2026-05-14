import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Superscript } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    superscript: {
      parseDOM: Superscript.parseHTML() || [],
      toDOM: (m: any) => ["sup", (m.attrs?.class ? { class: m.attrs.class } : {})],
    },
  },
});

describe("Superscript", () => {
  it("extension is defined", () => {
    expect(Superscript).toBeDefined();
    expect(Superscript.name).toBe("superscript");
  });

  it("renderHTML returns <sup> tag", () => {
    const result = Superscript.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("sup");
  });

  it("round-trips HTML: serialize then re-parse superscript mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [
        schema.text("styled", [schema.mark("superscript")]),
      ]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<sup");
  });

  it("re-parses <sup> back into superscript mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><sup>parsed</sup></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "superscript")).toBe(true);
  });

  if (Superscript.addCommands) {
    it("registers commands", () => {
      const cmds = Superscript.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Superscript.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Superscript.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});
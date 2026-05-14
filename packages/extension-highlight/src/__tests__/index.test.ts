import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Highlight } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    highlight: {
      parseDOM: Highlight.parseHTML() || [],
      toDOM: (m: any) => ["mark", (m.attrs?.class ? { class: m.attrs.class } : {})],
    },
  },
});

describe("Highlight", () => {
  it("extension is defined", () => {
    expect(Highlight).toBeDefined();
    expect(Highlight.name).toBe("highlight");
  });

  it("renderHTML returns <mark> tag", () => {
    const result = Highlight.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("mark");
  });

  it("round-trips HTML: serialize then re-parse highlight mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [
        schema.text("styled", [schema.mark("highlight")]),
      ]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<mark");
  });

  it("re-parses <mark> back into highlight mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><mark>parsed</mark></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "highlight")).toBe(true);
  });

  if (Highlight.addCommands) {
    it("registers commands", () => {
      const cmds = Highlight.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Highlight.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Highlight.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});
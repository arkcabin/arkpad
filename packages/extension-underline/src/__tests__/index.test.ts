import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Underline } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    underline: {
      parseDOM: Underline.parseHTML() || [],
      toDOM: (m: any) => ["u", (m.attrs?.class ? { class: m.attrs.class } : {})],
    },
  },
});

describe("Underline", () => {
  it("extension is defined", () => {
    expect(Underline).toBeDefined();
    expect(Underline.name).toBe("underline");
  });

  it("renderHTML returns <u> tag", () => {
    const result = Underline.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("u");
  });

  it("round-trips HTML: serialize then re-parse underline mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [
        schema.text("styled", [schema.mark("underline")]),
      ]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<u");
  });

  it("re-parses <u> back into underline mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><u>parsed</u></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "underline")).toBe(true);
  });

  if (Underline.addCommands) {
    it("registers commands", () => {
      const cmds = Underline.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Underline.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Underline.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});
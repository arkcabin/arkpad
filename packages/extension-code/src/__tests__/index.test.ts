import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Code } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
  },
  marks: {
    code: {
      parseDOM: Code.parseHTML() || [],
      toDOM: (m: any) => ["code", m.attrs?.class ? { class: m.attrs.class } : {}],
    },
  },
});

describe("Code", () => {
  it("extension is defined", () => {
    expect(Code).toBeDefined();
    expect(Code.name).toBe("code");
  });

  it("renderHTML returns <code> tag", () => {
    const result = Code.renderHTML({ node: {} as any, HTMLAttributes: {} });
    expect(result).toBeDefined();
    expect(result[0]).toBe("code");
  });

  it("round-trips HTML: serialize then re-parse code mark", () => {
    const doc = schema.node("doc", null, [
      schema.node("paragraph", null, [schema.text("styled", [schema.mark("code")])]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<code");
  });

  it("re-parses <code> back into code mark", () => {
    const el = document.createElement("div");
    el.innerHTML = "<p><code>parsed</code></p>";
    const parsed = DOMParser.fromSchema(schema).parse(el);
    const textNode = parsed.firstChild?.firstChild;
    expect(textNode).toBeDefined();
    expect(textNode!.marks.some((m: any) => m.type.name === "code")).toBe(true);
  });

  if (Code.addCommands) {
    it("registers commands", () => {
      const cmds = Code.addCommands?.();
      expect(cmds).toBeDefined();
    });
  }

  if (Code.addKeyboardShortcuts) {
    it("registers keyboard shortcuts", () => {
      const shortcuts = Code.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
    });
  }
});

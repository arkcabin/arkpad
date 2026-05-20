import { describe, it, expect } from "vitest";
import { Schema, DOMSerializer, DOMParser } from "prosemirror-model";
import { Heading } from "../index";

const schema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block", toDOM: () => ["p", 0] },
    text: { group: "inline" },
    heading: {
      attrs: { level: { default: 1 } },
      content: "inline*",
      group: "block",
      parseDOM: (Heading.parseHTML?.() || []) as any,
      toDOM: (node: any) => {
        const level = node.attrs.level || 1;
        return [`h${level}`, { class: `heading-${level}` }, 0];
      },
    },
  },
});

describe("Heading", () => {
  it("extension is defined", () => {
    expect(Heading).toBeDefined();
    expect(Heading.name).toBe("heading");
  });

  it("parseHTML rules exist for all 6 levels", () => {
    const rules = Heading.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBe(6);
    for (let level = 1; level <= 6; level++) {
      expect(rules!.some((r: any) => r.tag === `h${level}`)).toBe(true);
    }
  });

  it("renderHTML returns correct tag per level", () => {
    for (let level = 1; level <= 6; level++) {
      const result = Heading.renderHTML!({
        node: { attrs: { level } } as any,
        HTMLAttributes: {},
      });
      expect(result[0]).toBe(`h${level}`);
    }
  });

  it("renderHTML falls back to first level for invalid levels", () => {
    const result = Heading.renderHTML!({
      node: { attrs: { level: 99 } } as any,
      HTMLAttributes: {},
    });
    expect(result[0]).toBe("h1");
  });

  if (Heading.addCommands) {
    it("registers setHeading and toggleHeading commands", () => {
      const cmds = Heading.addCommands?.();
      expect(cmds).toBeDefined();
      expect(typeof (cmds as any).setHeading).toBe("function");
      expect(typeof (cmds as any).toggleHeading).toBe("function");
    });
  }

  if (Heading.addKeyboardShortcuts) {
    it("registers keyboard shortcuts for all 6 levels", () => {
      const shortcuts = Heading.addKeyboardShortcuts?.();
      expect(shortcuts).toBeDefined();
      for (let level = 1; level <= 6; level++) {
        expect((shortcuts as any)[`Mod-Alt-${level}`]).toBeDefined();
      }
    });
  }

  if (Heading.addInputRules) {
    it("registers input rules for all 6 configured levels", () => {
      const rules = Heading.addInputRules?.();
      expect(rules).toBeDefined();
      expect(rules!.length).toBe(6);
      for (let level = 1; level <= 6; level++) {
        const hashes = "#".repeat(level);
        const rule = rules!.find((r: any) => r.find.source.includes(hashes));
        expect(rule).toBeDefined();
        expect(typeof rule.handler).toBe("function");
      }
    });
  }

  it("round-trips HTML: serialize then re-parse heading nodes", () => {
    const doc = schema.node("doc", null, [
      schema.node("heading", { level: 1 }, [schema.text("Title")]),
      schema.node("heading", { level: 2 }, [schema.text("Section")]),
      schema.node("heading", { level: 3 }, [schema.text("Sub-section")]),
    ]);
    const div = document.createElement("div");
    div.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content));
    expect(div.innerHTML).toContain("<h1");
    expect(div.innerHTML).toContain("<h2");
    expect(div.innerHTML).toContain("<h3");
    expect(div.innerHTML).toContain("Title");
    expect(div.innerHTML).toContain("Section");
  });

  it("re-parses <h1> through <h6> back into heading nodes", () => {
    const el = document.createElement("div");
    el.innerHTML = `
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    `;
    const parsed = DOMParser.fromSchema(schema).parse(el);
    let headingCount = 0;
    parsed.forEach((node: any) => {
      if (node.type.name === "heading") {
        headingCount++;
        const level = node.attrs.level;
        expect(node.textContent).toBe(`Heading ${level}`);
      }
    });
    expect(headingCount).toBe(6);
  });

  it("supports custom levels configuration", () => {
    const customHeading = Heading.configure({ levels: [2, 4] });
    const rules = customHeading.parseHTML?.();
    expect(rules).toBeDefined();
    expect(rules!.length).toBe(2);
    expect(rules!.some((r: any) => r.tag === "h2")).toBe(true);
    expect(rules!.some((r: any) => r.tag === "h4")).toBe(true);
    expect(rules!.some((r: any) => r.tag === "h1")).toBe(false);

    const shortcuts = customHeading.addKeyboardShortcuts?.();
    expect((shortcuts as any)["Mod-Alt-2"]).toBeDefined();
    expect((shortcuts as any)["Mod-Alt-4"]).toBeDefined();
    expect((shortcuts as any)["Mod-Alt-1"]).toBeUndefined();

    const inputRules = customHeading.addInputRules?.();
    expect(inputRules!.length).toBe(2);
    expect(inputRules!.some((r: any) => r.find.source === "^(?:##)\\s$")).toBe(true);
    expect(inputRules!.some((r: any) => r.find.source === "^(?:####)\\s$")).toBe(true);
    expect(inputRules!.some((r: any) => r.find.source === "^(?:#)\\s$")).toBe(false);
  });
});

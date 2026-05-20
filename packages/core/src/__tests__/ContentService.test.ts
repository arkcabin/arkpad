import { describe, it, expect } from "vitest";
import { Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { ContentService } from "../services/editor/ContentService";

const testSchema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block" },
    text: { group: "inline" },
  },
  marks: {},
});

function createMockEditor() {
  const state = EditorState.create({ schema: testSchema });
  return {
    extensionManager: { schema: testSchema },
    getSchema: () => testSchema,
    getState: () => state,
  } as any;
}

describe("ContentService", () => {
  it("generates HTML from editor state", () => {
    const service = new ContentService(createMockEditor());
    const html = service.getHTML();
    expect(typeof html).toBe("string");
  });

  it("generates JSON from editor state", () => {
    const service = new ContentService(createMockEditor());
    const json = service.getJSON();
    expect(json).toBeDefined();
  });
});

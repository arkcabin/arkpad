import { describe, it, expect } from "vitest";
import { createMarkdownPaste } from "../index";

describe("Markdown", () => {
  it("creates paste handler extension", () => {
    const ext = createMarkdownPaste();
    expect(ext).toBeDefined();
  });
});

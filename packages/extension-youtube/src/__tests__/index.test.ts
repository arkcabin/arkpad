import { describe, it, expect } from "vitest";
import { Youtube, getYoutubeEmbedUrl, isYoutubeUrl } from "../index";

describe("Youtube", () => {
  it("extension is defined", () => {
    expect(Youtube).toBeDefined();
    expect(Youtube.name).toBe("youtube");
  });

  it("has inline=false and group='block'", () => {
    expect((Youtube as any).config.inline).toBe(false);
    expect((Youtube as any).config.group).toBe("block");
  });

  it("provides parseHTML rules for div[data-type='youtube'] and iframe", () => {
    const rules = Youtube.parseHTML();
    expect(rules.length).toBe(2);
    expect(rules[0].tag).toBe("div[data-type='youtube']");
    expect(rules[1].tag).toBe("iframe[src*=youtube]");
  });

  it("registers setYoutubeVideo command", () => {
    const cmds = Youtube.addCommands?.();
    expect(cmds).toBeDefined();
    expect(cmds).toHaveProperty("setYoutubeVideo");
  });

  it("creates a ProseMirror plugin for paste handling", () => {
    const plugins = Youtube.addProseMirrorPlugins?.();
    expect(plugins).toBeDefined();
    expect(plugins!.length).toBe(1);
  });

  it("has src attribute with default null", () => {
    const attrs = Youtube.addAttributes?.();
    expect(attrs).toBeDefined();
    expect((attrs as any).src.default).toBeNull();
  });
});

describe("getYoutubeEmbedUrl", () => {
  it("converts youtube.com/watch?v= URL", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("converts youtu.be URL", () => {
    expect(getYoutubeEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("converts youtube.com/embed/ URL", () => {
    expect(getYoutubeEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("handles URLs without protocol", () => {
    expect(getYoutubeEmbedUrl("youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("handles URLs without www", () => {
    expect(getYoutubeEmbedUrl("https://youtube.com/watch?v=dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/embed/dQw4w9WgXcQ"
    );
  });

  it("returns null for non-YouTube URLs", () => {
    expect(getYoutubeEmbedUrl("https://vimeo.com/12345")).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(getYoutubeEmbedUrl("")).toBeNull();
    expect(getYoutubeEmbedUrl("not a url")).toBeNull();
  });
});

describe("isYoutubeUrl", () => {
  it("returns true for youtube.com/watch?v= URL", () => {
    expect(isYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
  });

  it("returns true for youtu.be URL", () => {
    expect(isYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
  });

  it("returns true for youtube.com/embed/ URL", () => {
    expect(isYoutubeUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe(true);
  });

  it("returns false when URL is surrounded by other text", () => {
    expect(isYoutubeUrl("Check this: https://youtu.be/dQw4w9WgXcQ it's cool")).toBe(false);
  });

  it("returns false for non-YouTube URLs", () => {
    expect(isYoutubeUrl("https://vimeo.com/12345")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isYoutubeUrl("")).toBe(false);
  });
});

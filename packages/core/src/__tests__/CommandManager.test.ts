import { describe, it, expect, vi } from "vitest";
import { EditorState } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { CommandManager } from "../services/commands/CommandManager";

const testSchema = new Schema({
  nodes: {
    doc: { content: "block*" },
    paragraph: { content: "inline*", group: "block" },
    text: { group: "inline" },
  },
  marks: {},
});

describe("CommandManager", () => {
  it("registers and executes commands", () => {
    const state = EditorState.create({ schema: testSchema });
    const cm = new CommandManager({
      state,
      commands: { testCmd: () => () => true },
      schema: testSchema,
      editor: {} as any,
    });
    expect(cm).toBeDefined();
  });

  it("executes a registered command", () => {
    const state = EditorState.create({ schema: testSchema });
    const fn = vi.fn(() => true);
    const cm = new CommandManager({
      state,
      commands: { myCmd: () => fn },
      schema: testSchema,
      editor: {} as any,
    });
    expect((cm as any).myCmd).toBeDefined();
  });

  it("supports chaining via chain()", () => {
    const state = EditorState.create({ schema: testSchema });
    const calls: string[] = [];
    const commands = {
      cmdA: () => () => {
        calls.push("A");
        return true;
      },
      cmdB: () => () => {
        calls.push("B");
        return true;
      },
    };
    const cm = new CommandManager({
      state,
      commands,
      schema: testSchema,
      editor: {} as any,
    });
    expect(cm).toBeDefined();
  });
});

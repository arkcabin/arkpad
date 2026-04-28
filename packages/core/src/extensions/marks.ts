import { toggleMark } from "prosemirror-commands";
import { arkpadSchema } from "../schema";
import { Extension } from "../extensions-types";
import { markInputRule } from "./utils";

export function createBold(): Extension {
  return {
    name: "bold",
    addCommands: () => ({
      toggleBold: () => toggleMark(arkpadSchema.marks.strong!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-b": toggleMark(arkpadSchema.marks.strong!),
    }),
    addInputRules: (schema) => [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, schema.marks.strong!),
    ],
  };
}

export function createItalic(): Extension {
  return {
    name: "italic",
    addCommands: () => ({
      toggleItalic: () => toggleMark(arkpadSchema.marks.em!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-i": toggleMark(arkpadSchema.marks.em!),
    }),
    addInputRules: (schema) => [
      markInputRule(/(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)$/, schema.marks.em!),
    ],
  };
}

export function createStrike(): Extension {
  return {
    name: "strike",
    addCommands: () => ({
      toggleStrike: () => toggleMark(arkpadSchema.marks.strike!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-Shift-s": toggleMark(arkpadSchema.marks.strike!),
    }),
    addInputRules: (schema) => [markInputRule(/~~([^~]+)~~$/, schema.marks.strike!)],
  };
}

export function createUnderline(): Extension {
  return {
    name: "underline",
    addCommands: () => ({
      toggleUnderline: () => toggleMark(arkpadSchema.marks.underline!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-u": toggleMark(arkpadSchema.marks.underline!),
    }),
  };
}

export function createCode(): Extension {
  return {
    name: "code",
    addCommands: () => ({
      toggleCode: () => toggleMark(arkpadSchema.marks.code!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-e": toggleMark(arkpadSchema.marks.code!),
    }),
    addInputRules: (schema) => [markInputRule(/(?:^|[^`])`([^`]+)`$/, schema.marks.code!)],
  };
}

export function createLink(): Extension {
  return {
    name: "link",
    addCommands: () => ({
      toggleLink: (href: string) => toggleMark(arkpadSchema.marks.link!, { href }),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-k": toggleMark(arkpadSchema.marks.link!, { href: "https://" }),
    }),
  };
}
export function createSuperscript(): Extension {
  return {
    name: "superscript",
    addCommands: () => ({
      toggleSuperscript: () => toggleMark(arkpadSchema.marks.superscript!),
    }),
  };
}

export function createSubscript(): Extension {
  return {
    name: "subscript",
    addCommands: () => ({
      toggleSubscript: () => toggleMark(arkpadSchema.marks.subscript!),
    }),
  };
}
export function createHighlight(): Extension {
  return {
    name: "highlight",
    addCommands: () => ({
      toggleHighlight: () => toggleMark(arkpadSchema.marks.highlight!),
    }),
    addInputRules: (schema) => [markInputRule(/==([^=]+)==$/, schema.marks.highlight!)],
  };
}

import { toggleMark } from "prosemirror-commands";
import { arkpadSchema } from "../schema";
import { Extension } from "../extensions-types";

export function createBold(): Extension {
  return {
    name: "bold",
    addCommands: () => ({
      toggleBold: () => toggleMark(arkpadSchema.marks.strong!),
    }),
    addKeyboardShortcuts: () => ({
      "Mod-b": toggleMark(arkpadSchema.marks.strong!),
    }),
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

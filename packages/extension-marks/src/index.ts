/* eslint-disable @typescript-eslint/no-explicit-any */
import { toggleMark } from "prosemirror-commands";
import { Extension, type Dispatch } from "@arkpad/shared";
import { type EditorState } from "prosemirror-state";
import { type Schema } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";

/**
 * markInputRule is a helper to create input rules for marks.
 * (Copied from core/utils.ts to maintain independence)
 */
function markInputRule(regexp: RegExp, markType: any, getAttrs?: any) {
  return new InputRule(regexp, (state, match, start, end) => {
    const attrs = getAttrs instanceof Function ? getAttrs(match) : getAttrs;
    const { tr } = state;
    if (match[1]) {
      const textStart = start + match[0].indexOf(match[1]);
      const textEnd = textStart + match[1].length;
      tr.addMark(textStart, textEnd, markType.create(attrs));
      tr.delete(textEnd, end);
      tr.delete(start, textStart);
      tr.removeStoredMark(markType);
    }
    return tr;
  });
}

export function createBold(): Extension {
  return Extension.create({
    name: "bold",
    addMarks() {
      return {
        strong: {
          parseDOM: [
            { tag: "strong" },
            {
              tag: "b",
              getAttrs: (node: HTMLElement) => node.style.fontWeight !== "normal" && null,
            },
            {
              style: "font-weight",
              getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
            },
          ],
          toDOM() {
            return ["strong", 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleBold: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["strong"]!)(state, dispatch),
    }),
    addKeyboardShortcuts: (schema: Schema) => ({
      "Mod-b": toggleMark(schema.marks["strong"]!),
    }),
    addInputRules: (schema: Schema) => [
      markInputRule(/(?:\*\*|__)([^*_]+)(?:\*\*|__)$/, schema.marks["strong"]!),
    ],
  });
}

export function createItalic(): Extension {
  return Extension.create({
    name: "italic",
    addMarks() {
      return {
        em: {
          parseDOM: [{ tag: "i" }, { tag: "em" }, { style: "font-style=italic" }],
          toDOM() {
            return ["em", 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleItalic: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["em"]!)(state, dispatch),
    }),
    addKeyboardShortcuts: (schema: Schema) => ({
      "Mod-i": toggleMark(schema.marks["em"]!),
    }),
    addInputRules: (schema: Schema) => [
      markInputRule(/(?:^|[^*_])(?:\*|_)([^*_]+)(?:\*|_)$/, schema.marks["em"]!),
    ],
  });
}

export function createStrike(): Extension {
  return Extension.create({
    name: "strike",
    addMarks() {
      return {
        strike: {
          parseDOM: [{ tag: "s" }, { tag: "strike" }, { style: "text-decoration=line-through" }],
          toDOM() {
            return ["s", 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleStrike: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["strike"]!)(state, dispatch),
    }),
    addKeyboardShortcuts: (schema: Schema) => ({
      "Mod-Shift-s": toggleMark(schema.marks["strike"]!),
    }),
    addInputRules: (schema: Schema) => [markInputRule(/~~([^~]+)~~$/, schema.marks["strike"]!)],
  });
}

export function createUnderline(): Extension {
  return Extension.create({
    name: "underline",
    addMarks() {
      return {
        underline: {
          parseDOM: [{ tag: "u" }, { style: "text-decoration=underline" }],
          toDOM() {
            return ["u", 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleUnderline: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["underline"]!)(state, dispatch),
    }),
    addKeyboardShortcuts: (schema: Schema) => ({
      "Mod-u": toggleMark(schema.marks["underline"]!),
    }),
  });
}

export function createCode(): Extension {
  return Extension.create({
    name: "code",
    addMarks() {
      return {
        code: {
          parseDOM: [{ tag: "code" }],
          toDOM() {
            return ["code", 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleCode: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["code"]!)(state, dispatch),
    }),
    addKeyboardShortcuts: (schema: Schema) => ({
      "Mod-e": toggleMark(schema.marks["code"]!),
    }),
    addInputRules: (schema: Schema) => [
      markInputRule(/(?:^|[^`])`([^`]+)`$/, schema.marks["code"]!),
    ],
  });
}

export function createLink(): Extension {
  return Extension.create({
    name: "link",
    addMarks() {
      return {
        link: {
          attrs: {
            href: {},
            target: { default: null },
            title: { default: null },
          },
          inclusive: false,
          parseDOM: [
            {
              tag: "a[href]",
              getAttrs(dom: HTMLElement) {
                return {
                  href: dom.getAttribute("href"),
                  target: dom.getAttribute("target"),
                  title: dom.getAttribute("title"),
                };
              },
            },
          ],
          toDOM(node: any) {
            return ["a", node.attrs, 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleLink: (href: string) => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["link"]!, { href })(state, dispatch),
    }),
    addKeyboardShortcuts: (schema: Schema) => ({
      "Mod-k": toggleMark(schema.marks["link"]!, { href: "https://" }),
    }),
  });
}

export function createSuperscript(): Extension {
  return Extension.create({
    name: "superscript",
    addMarks() {
      return {
        superscript: {
          parseDOM: [{ tag: "sup" }],
          toDOM() {
            return ["sup", 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleSuperscript: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["superscript"]!)(state, dispatch),
    }),
  });
}

export function createSubscript(): Extension {
  return Extension.create({
    name: "subscript",
    addMarks() {
      return {
        subscript: {
          parseDOM: [{ tag: "sub" }],
          toDOM() {
            return ["sub", 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleSubscript: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["subscript"]!)(state, dispatch),
    }),
  });
}

export function createHighlight(): Extension {
  return Extension.create({
    name: "highlight",
    addMarks() {
      return {
        highlight: {
          parseDOM: [{ tag: "mark" }],
          toDOM() {
            return ["mark", { "data-type": "highlight" }, 0];
          },
        },
      };
    },
    addCommands: () => ({
      toggleHighlight: () => (state: EditorState, dispatch?: Dispatch) =>
        toggleMark(state.schema.marks["highlight"]!)(state, dispatch),
    }),
    addInputRules: (schema: Schema) => [markInputRule(/==([^=]+)==$/, schema.marks["highlight"]!)],
  });
}

export function createClearFormatting(): Extension {
  return Extension.create({
    name: "clearFormatting",
    addCommands: () => ({
      unsetAllMarks: () => (state: EditorState, dispatch?: Dispatch) => {
        const { tr, selection } = state;
        const { from, to, empty } = selection;

        if (empty) return false;

        tr.removeMark(from, to, null);

        if (dispatch) dispatch(tr);
        return true;
      },
    }),
  });
}

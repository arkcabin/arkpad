import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";

const nodes = addListNodes(
  basicSchema.spec.nodes
    .update("doc", { content: "block+" })
    .update("paragraph", {
      content: "inline*",
      group: "block",
      parseDOM: [{ tag: "p" }],
      toDOM() {
        return ["p", 0];
      },
    })
    .append({
      heading: {
        attrs: { level: { default: 1 } },
        content: "inline*",
        group: "block",
        defining: true,
        parseDOM: [
          { tag: "h1", attrs: { level: 1 } },
          { tag: "h2", attrs: { level: 2 } },
          { tag: "h3", attrs: { level: 3 } },
          { tag: "h4", attrs: { level: 4 } },
          { tag: "h5", attrs: { level: 5 } },
          { tag: "h6", attrs: { level: 6 } },
        ],
        toDOM(node) {
          return ["h" + node.attrs.level, 0];
        },
      },
      blockquote: {
        content: "block+",
        group: "block",
        defining: true,
        parseDOM: [{ tag: "blockquote" }],
        toDOM() {
          return ["blockquote", 0];
        },
      },
      codeBlock: {
        content: "text*",
        marks: "",
        group: "block",
        code: true,
        defining: true,
        attrs: { language: { default: "" } },
        parseDOM: [{ tag: "pre", preserveWhitespace: "full" }],
        toDOM() {
          return ["pre", ["code", 0]];
        },
      },
      horizontalRule: {
        group: "block",
        attrs: {},
        parseDOM: [{ tag: "hr" }],
        toDOM() {
          return ["hr"];
        },
      },
      hardBreak: {
        inline: true,
        group: "inline",
        selectable: false,
        attrs: {},
        parseDOM: [{ tag: "br" }],
        toDOM() {
          return ["br"];
        },
      },
      image: {
        inline: true,
        attrs: {
          src: {},
          alt: { default: null },
          title: { default: null },
        },
        group: "inline",
        draggable: true,
        parseDOM: [
          {
            tag: "img[src]",
            getAttrs(dom: HTMLElement) {
              return {
                src: dom.getAttribute("src"),
                alt: dom.getAttribute("alt"),
                title: dom.getAttribute("title"),
              };
            },
          },
        ],
        toDOM(node) {
          return ["img", node.attrs];
        },
      },
      bulletList: {
        content: "listItem+",
        group: "block",
        parseDOM: [{ tag: "ul" }],
        toDOM() {
          return ["ul", 0];
        },
      },
      orderedList: {
        attrs: { order: { default: 1 } },
        content: "listItem+",
        group: "block",
        parseDOM: [
          {
            tag: "ol",
            getAttrs(dom: HTMLElement) {
              return { order: dom.hasAttribute("start") ? +dom.getAttribute("start")! : 1 };
            },
          },
        ],
        toDOM(node) {
          return node.attrs.order === 1
            ? ["ol", 0]
            : ["ol", { start: node.attrs.order }, 0];
        },
      },
      listItem: {
        content: "paragraph block*",
        parseDOM: [{ tag: "li" }],
        toDOM() {
          return ["li", 0];
        },
        defining: true,
      },
      taskList: {
        content: "taskItem+",
        group: "block",
        parseDOM: [{ tag: "ul.task-list" }],
        toDOM() {
          return ["ul", { class: "task-list" }, 0];
        },
      },
      taskItem: {
        attrs: { checked: { default: false } },
        content: "paragraph block*",
        group: "block",
        parseDOM: [
          {
            tag: "li.task-item",
            getAttrs(dom: HTMLElement) {
              return { checked: dom.classList.contains("checked") };
            },
          },
        ],
        toDOM(node) {
          return ["li", { class: "task-item" + (node.attrs.checked ? " checked" : "") }, 0];
        },
        defining: true,
      },
    }),
  "paragraph block*",
  "block"
);

const marks = basicSchema.spec.marks
  .append({
    strong: {
      parseDOM: [
        { tag: "strong" },
        { tag: "b", getAttrs: (node: HTMLElement) => node.style.fontWeight !== "normal" && null },
        { style: "font-weight", getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
      ],
      toDOM() {
        return ["strong", 0];
      },
    },
    em: {
      parseDOM: [
        { tag: "i" },
        { tag: "em" },
        { style: "font-style=italic" },
      ],
      toDOM() {
        return ["em", 0];
      },
    },
    code: {
      parseDOM: [{ tag: "code" }],
      toDOM() {
        return ["code", 0];
      },
    },
    strike: {
      parseDOM: [
        { tag: "s" },
        { tag: "strike" },
        { style: "text-decoration=line-through" },
      ],
      toDOM() {
        return ["s", 0];
      },
    },
    underline: {
      parseDOM: [
        { tag: "u" },
        { style: "text-decoration=underline" },
      ],
      toDOM() {
        return ["u", 0];
      },
    },
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
      toDOM(node) {
        return ["a", node.attrs, 0];
      },
    },
  });

export const arkpadSchema = new Schema({ nodes, marks });
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { getAlignmentAttr } from "./utils";

const nodes = addListNodes(
  basicSchema.spec.nodes
    .update("doc", { content: "block+" })
    .update("paragraph", {
      content: "inline*",
      group: "block",
      attrs: { align: { default: "left" } },
      parseDOM: [
        {
          tag: "p",
          getAttrs: (dom: HTMLElement) => getAlignmentAttr(dom),
        },
      ],
      toDOM(node) {
        const { align } = node.attrs;
        return [
          "p",
          { "data-align": align, style: align !== "left" ? `text-align: ${align}` : null },
          0,
        ];
      },
    })
    .append({
      heading: {
        attrs: { level: { default: 1 }, align: { default: "left" } },
        content: "inline*",
        group: "block",
        defining: true,
        parseDOM: [
          { tag: "h1", getAttrs: (dom: HTMLElement) => ({ level: 1, ...getAlignmentAttr(dom) }) },
          { tag: "h2", getAttrs: (dom: HTMLElement) => ({ level: 2, ...getAlignmentAttr(dom) }) },
          { tag: "h3", getAttrs: (dom: HTMLElement) => ({ level: 3, ...getAlignmentAttr(dom) }) },
          { tag: "h4", getAttrs: (dom: HTMLElement) => ({ level: 4, ...getAlignmentAttr(dom) }) },
          { tag: "h5", getAttrs: (dom: HTMLElement) => ({ level: 5, ...getAlignmentAttr(dom) }) },
          { tag: "h6", getAttrs: (dom: HTMLElement) => ({ level: 6, ...getAlignmentAttr(dom) }) },
        ],
        toDOM(node) {
          const { level, align } = node.attrs;
          return [
            "h" + level,
            { "data-align": align, style: align !== "left" ? `text-align: ${align}` : null },
            0,
          ];
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
        attrs: { language: { default: "" }, align: { default: "left" } },
        parseDOM: [
          {
            tag: "pre",
            preserveWhitespace: "full",
            getAttrs: (dom: HTMLElement) => getAlignmentAttr(dom),
          },
        ],
        toDOM(node) {
          const { align } = node.attrs;
          return [
            "pre",
            { "data-align": align, style: align !== "left" ? `text-align: ${align}` : null },
            ["code", 0],
          ];
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
          return node.attrs.order === 1 ? ["ol", 0] : ["ol", { start: node.attrs.order }, 0];
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

const marks = basicSchema.spec.marks;

export const arkpadSchema = new Schema({ nodes, marks });

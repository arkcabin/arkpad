import { ArkpadDocJSON } from "../api";

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  content: ArkpadDocJSON;
}

export const templates: PageTemplate[] = [
  {
    id: "blank",
    name: "Blank Document",
    description: "Start writing from scratch",
    category: "Basic",
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Start writing..." }],
        },
      ],
    },
  },
  {
    id: "article",
    name: "Article",
    description: "A standard article layout with headings and paragraphs",
    category: "Writing",
    content: {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Article Title" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Begin your article here. You can use standard formatting like bold, italic, and links.",
            },
          ],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "First Section" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Standard rich text editing is now the core focus of Arkpad.",
            },
          ],
        },
      ],
    },
  },
];

export function getTemplates(): PageTemplate[] {
  return templates;
}

export function getTemplateById(id: string): PageTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): PageTemplate[] {
  return templates.filter((t) => t.category === category);
}

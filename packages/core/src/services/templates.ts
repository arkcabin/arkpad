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
    name: "Blank Page",
    description: "Start from scratch",
    category: "Basic",
    content: {
      type: "doc",
      attrs: { title: "Untitled Page", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "60px 0", backgroundColor: "transparent" },
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Start typing..." }],
            },
          ],
        },
      ],
    },
  },
  {
    id: "hero-section",
    name: "Hero Section",
    description: "Full-width hero with CTA",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Hero Page", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "100px 0", backgroundColor: "#f8fafc" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "800px", padding: "0 20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 1 },
                  content: [{ type: "text", text: "Build Something Amazing" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Create beautiful, interactive pages with our powerful drag-and-drop builder. No coding required.",
                    },
                  ],
                },
                {
                  type: "button",
                  attrs: { text: "Get Started", variant: "primary" },
                  content: [{ type: "text", text: "Get Started" }],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "features",
    name: "Features Grid",
    description: "3-column feature showcase",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Features Page", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0", backgroundColor: "transparent" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Features" }],
                },
                {
                  type: "grid",
                  attrs: { columns: 3, gap: "40px" },
                  content: [
                    {
                      type: "card",
                      attrs: { title: "Fast Performance" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Lightning fast load times" }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Easy to Use" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Intuitive drag and drop" }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Fully Customizable" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Make it truly yours" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "about",
    name: "About Us",
    description: "Team and company info",
    category: "Pages",
    content: {
      type: "doc",
      attrs: { title: "About Us", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0", backgroundColor: "#ffffff" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "800px", padding: "20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 1 },
                  content: [{ type: "text", text: "About Us" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "We are a team of passionate developers building the best page builder tools.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "section",
          attrs: { padding: "60px 0", backgroundColor: "#f8fafc" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Our Team" }],
                },
                {
                  type: "grid",
                  attrs: { columns: 4, gap: "30px" },
                  content: [
                    {
                      type: "card",
                      attrs: { title: "Team Member 1" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "CEO" }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Team Member 2" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "CTO" }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Team Member 3" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Designer" }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Team Member 4" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Developer" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "contact",
    name: "Contact Page",
    description: "Contact form and info",
    category: "Pages",
    content: {
      type: "doc",
      attrs: { title: "Contact", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0", backgroundColor: "#ffffff" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "600px", padding: "20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 1 },
                  content: [{ type: "text", text: "Get in Touch" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Have questions? We'd love to hear from you.",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "section",
          attrs: { padding: "40px 0", backgroundColor: "#f8fafc" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "600px", padding: "20px" },
              content: [
                {
                  type: "card",
                  attrs: { title: "Send us a message" },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "Contact form placeholder" }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "blog",
    name: "Blog Listing",
    description: "Blog post grid",
    category: "Pages",
    content: {
      type: "doc",
      attrs: { title: "Blog", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "60px 0", backgroundColor: "#ffffff" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 1 },
                  content: [{ type: "text", text: "Our Blog" }],
                },
              ],
            },
          ],
        },
        {
          type: "section",
          attrs: { padding: "40px 0", backgroundColor: "#f8fafc" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "grid",
                  attrs: { columns: 3, gap: "30px" },
                  content: [
                    {
                      type: "card",
                      attrs: { title: "Blog Post 1" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Lorem ipsum dolor sit amet..." }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Blog Post 2" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Lorem ipsum dolor sit amet..." }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Blog Post 3" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Lorem ipsum dolor sit amet..." }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "pricing",
    name: "Pricing Table",
    description: "3-tier pricing cards",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Pricing", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "80px 0", backgroundColor: "#ffffff" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "heading",
                  attrs: { level: 2 },
                  content: [{ type: "text", text: "Pricing Plans" }],
                },
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: "Choose the plan that works for you",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "section",
          attrs: { padding: "40px 0", backgroundColor: "#f8fafc" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "grid",
                  attrs: { columns: 3, gap: "30px" },
                  content: [
                    {
                      type: "card",
                      attrs: { title: "Starter" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "$9/mo" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Perfect for individuals" }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Pro" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "$29/mo" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Best for small teams" }],
                        },
                      ],
                    },
                    {
                      type: "card",
                      attrs: { title: "Enterprise" },
                      content: [
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Custom" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "For large organizations" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  },
  {
    id: "footer",
    name: "Footer",
    description: "Multi-column site footer",
    category: "Sections",
    content: {
      type: "doc",
      attrs: { title: "Footer Page", theme: "light", maxWidth: "1200px" },
      content: [
        {
          type: "section",
          attrs: { padding: "60px 0", backgroundColor: "#1e293b" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "grid",
                  attrs: { columns: 4, gap: "40px" },
                  content: [
                    {
                      type: "container",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 4 },
                          content: [{ type: "text", text: "Product" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Features" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Pricing" }],
                        },
                      ],
                    },
                    {
                      type: "container",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 4 },
                          content: [{ type: "text", text: "Company" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "About" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Blog" }],
                        },
                      ],
                    },
                    {
                      type: "container",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 4 },
                          content: [{ type: "text", text: "Support" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Help Center" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Contact" }],
                        },
                      ],
                    },
                    {
                      type: "container",
                      content: [
                        {
                          type: "heading",
                          attrs: { level: 4 },
                          content: [{ type: "text", text: "Legal" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Privacy" }],
                        },
                        {
                          type: "paragraph",
                          content: [{ type: "text", text: "Terms" }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "section",
          attrs: { padding: "20px 0", backgroundColor: "#0f172a" },
          content: [
            {
              type: "container",
              attrs: { maxWidth: "1200px", padding: "20px" },
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "© 2024 Company Name. All rights reserved." }],
                },
              ],
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

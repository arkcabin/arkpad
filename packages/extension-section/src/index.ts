import { Node, ArkpadCommandProps } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setSection: (attrs?: { backgroundColor?: string; padding?: string }) => void;
  }
}

export interface SectionOptions {
  HTMLAttributes: Record<string, any>;
}

export const Section = Node.create<SectionOptions>({
  name: "section",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  content: "block+",
  group: "block",
  isLayout: true,
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
      padding: {
        default: "2rem",
        parseHTML: element => element.style.padding,
        renderHTML: attributes => {
          if (!attributes.padding) {
            return {};
          }
          return { style: `padding: ${attributes.padding}` };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "section[data-type='section']",
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ["section", { "data-type": "section", ...this.options.HTMLAttributes, ...HTMLAttributes }, 0];
  },

  addCommands() {
    return {
      setSection:
        (attrs?: { backgroundColor?: string; padding?: string }) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs,
              content: [
                {
                  type: "paragraph",
                },
              ],
            })
            .run();
        },
    };
  },

});

export default Section;

import { Node, ArkpadCommandProps } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setSection: (attrs?: Record<string, any>) => void;
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

  content: "block*",
  group: "block",
  isLayout: true,
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) return {};
          return { style: `background-color: ${attributes.backgroundColor}` };
        },
      },
      padding: {
        default: "2rem",
        parseHTML: (element) => element.style.padding,
        renderHTML: (attributes) => {
          if (!attributes.padding) return {};
          return { style: `padding: ${attributes.padding}` };
        },
      },
      marginTop: { default: "0px" },
      marginBottom: { default: "0px" },
      borderRadius: { default: "0px" },
      borderWidth: { default: "0px" },
      borderColor: { default: "transparent" },
      maxWidth: { default: "100%" },
    };
  },

  parseHTML() {
    return [{ tag: "section[data-type='section']" }];
  },

  renderHTML({ HTMLAttributes, node }: { HTMLAttributes: Record<string, any>; node: any }) {
    const {
      backgroundColor,
      padding,
      marginTop,
      marginBottom,
      borderRadius,
      borderWidth,
      borderColor,
      maxWidth,
    } = node.attrs;
    const styles = [
      backgroundColor ? `background-color: ${backgroundColor}` : "",
      padding ? `padding: ${padding}` : "",
      marginTop ? `margin-top: ${marginTop}` : "",
      marginBottom ? `margin-bottom: ${marginBottom}` : "",
      borderRadius ? `border-radius: ${borderRadius}` : "",
      borderWidth ? `border-width: ${borderWidth}` : "",
      borderColor ? `border-color: ${borderColor}` : "",
      borderWidth !== "0px" ? "border-style: solid" : "",
      maxWidth ? `max-width: ${maxWidth}` : "",
      "margin-left: auto",
      "margin-right: auto",
      "width: 100%",
    ]
      .filter(Boolean)
      .join("; ");

    return [
      "section",
      {
        "data-type": "section",
        class: "ark-section",
        style: styles,
        ...this.options.HTMLAttributes,
        ...HTMLAttributes,
      },
      0,
    ];
  },

  onInit() {
    this.editor.blockRegistry.registerBlock({
      type: "section",
      label: "Section",
      category: "layout",
      create: (options: any) => ({
        type: "section",
        attrs: options,
        content: options?.content || [],
      }),
    });
  },

  addCommands() {
    return {
      setSection:
        (attrs?: Record<string, any>) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs,
              content: attrs?.content || [],
            })
            .run();
        },
    };
  },
});

export default Section;

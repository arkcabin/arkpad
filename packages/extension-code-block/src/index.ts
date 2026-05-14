import { Node, ArkpadCommandProps, PMNode } from "@arkpad/core";

declare module "@arkpad/core" {
  interface ArkpadCommands {
    setCodeBlock: (attrs?: { language?: string }) => void;
    toggleCodeBlock: (attrs?: { language?: string }) => void;
  }
}

export interface CodeBlockOptions {
  HTMLAttributes: Record<string, any>;
  languageClassPrefix: string;
}

export const CodeBlock = Node.create<CodeBlockOptions>({
  name: "codeBlock",

  addOptions() {
    return {
      HTMLAttributes: {},
      languageClassPrefix: "language-",
    };
  },

  content: "text*",
  marks: "",
  group: "block",
  code: true,
  defining: true,
  isolating: true,
  whitespace: "pre",
  trailingNode: true,

  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const { languageClassPrefix } = this.options;
          const classList = Array.from(element.classList);
          const languageClass = classList.find((className) =>
            className.startsWith(languageClassPrefix)
          );

          if (languageClass) {
            return languageClass.replace(languageClassPrefix, "");
          }

          const codeElement = element.querySelector("code");

          if (!codeElement) {
            return null;
          }

          const codeClassList = Array.from(codeElement.classList);
          const codeLanguageClass = codeClassList.find((className) =>
            className.startsWith(languageClassPrefix)
          );

          return codeLanguageClass ? codeLanguageClass.replace(languageClassPrefix, "") : null;
        },
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.language) {
            return {};
          }

          return {
            class: `${this.options.languageClassPrefix}${attributes.language}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "pre",
        preserveWhitespace: "full",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }: { node: PMNode; HTMLAttributes: Record<string, any> }) {
    return [
      "pre",
      this.options.HTMLAttributes,
      [
        "code",
        {
          ...HTMLAttributes,
          class: node.attrs.language
            ? `${this.options.languageClassPrefix}${node.attrs.language}`
            : null,
        },
        0,
      ],
    ];
  },

  addCommands() {
    return {
      setCodeBlock:
        (attrs?: { language?: string }) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().setNode("codeBlock", attrs).run();
        },
      toggleCodeBlock:
        (attrs?: { language?: string }) =>
        ({ chain }: ArkpadCommandProps) => {
          return chain().toggleBlock("codeBlock", attrs).run();
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Alt-c": () => this.editor!.runCommand("toggleCodeBlock"),
    };
  },
});

export default CodeBlock;

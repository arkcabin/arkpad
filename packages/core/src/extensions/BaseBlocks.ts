import { Extension } from "../sdk/Extension";

/**
 * BaseBlocks extension registers standard typography and media blocks in the BlockRegistry.
 */
export const BaseBlocks = Extension.create({
  name: "baseBlocks",

  onInit() {
    const { blockRegistry } = this.editor;

    blockRegistry.registerBlock({
      type: "heading",
      label: "Heading",
      category: "typography",
      create: (options) => ({
        type: "heading",
        attrs: { level: options?.level || 2 },
        content: options?.content || [],
      }),
    });

    blockRegistry.registerBlock({
      type: "paragraph",
      label: "Text",
      category: "typography",
      create: (options) => ({
        type: "paragraph",
        content: options?.content || [],
      }),
    });

    blockRegistry.registerBlock({
      type: "blockquote",
      label: "Quote",
      category: "typography",
      create: () => ({
        type: "blockquote",
        content: [{ type: "paragraph" }],
      }),
    });

    blockRegistry.registerBlock({
      type: "bulletList",
      label: "Bullet List",
      category: "typography",
      create: () => ({
        type: "bulletList",
        content: [{ type: "listItem", content: [{ type: "paragraph" }] }],
      }),
    });

    blockRegistry.registerBlock({
      type: "codeBlock",
      label: "Code Block",
      category: "typography",
      create: () => ({
        type: "codeBlock",
        content: [],
      }),
    });

    blockRegistry.registerBlock({
      type: "horizontalRule",
      label: "Divider",
      category: "media",
      create: () => ({
        type: "horizontalRule",
      }),
    });
  },
});

export default BaseBlocks;

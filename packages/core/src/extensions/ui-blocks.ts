import { Extension } from "../sdk/Extension";

export const UIBlocks = Extension.create({
  name: "uiBlocks",

  onInit() {
    const { blockRegistry } = this.editor;

    blockRegistry.registerBlock({
      type: "button",
      label: "Button",
      category: "components",
      icon: "M4 7h16v10H4V7z",
      create: (options) => ({
        type: "button",
        attrs: {
          text: options?.text || "Click me",
          variant: options?.variant || "primary",
          href: options?.href || "",
        },
        content: [{ type: "text", text: options?.text || "Click me" }],
      }),
      styleConfig: {
        padding: true,
        backgroundColor: true,
        borderRadius: true,
        textAlign: true,
      },
      defaultAttrs: {
        text: "Click me",
        variant: "primary",
      },
    });

    blockRegistry.registerBlock({
      type: "card",
      label: "Card",
      category: "components",
      icon: "M4 4h16v16H4V4z",
      create: (options) => ({
        type: "card",
        attrs: {
          title: options?.title || "Card Title",
          padding: options?.padding || "24px",
        },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "Add your content here..." }],
          },
        ],
      }),
      styleConfig: {
        backgroundColor: true,
        padding: true,
        borderRadius: true,
        border: true,
      },
      defaultAttrs: {
        title: "Card Title",
      },
    });

    blockRegistry.registerBlock({
      type: "spacer",
      label: "Spacer",
      category: "layout",
      icon: "M6 4v16M18 4v16",
      create: (options) => ({
        type: "spacer",
        attrs: {
          height: options?.height || "40px",
        },
      }),
      defaultAttrs: {
        height: "40px",
      },
    });

    blockRegistry.registerBlock({
      type: "divider",
      label: "Divider",
      category: "layout",
      icon: "M4 12h16",
      create: (options) => ({
        type: "divider",
        attrs: {
          style: options?.style || "solid",
        },
      }),
    });

    blockRegistry.registerBlock({
      type: "container",
      label: "Container",
      category: "layout",
      icon: "M3 3h18v18H3z",
      create: (options) => ({
        type: "container",
        attrs: {
          maxWidth: options?.maxWidth || "1200px",
          padding: options?.padding || "20px",
        },
        content: [{ type: "paragraph" }],
      }),
      styleConfig: {
        maxWidth: true,
        padding: true,
        backgroundColor: true,
      },
    });

    blockRegistry.registerBlock({
      type: "grid",
      label: "Grid",
      category: "layout",
      icon: "M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z",
      create: (options) => ({
        type: "grid",
        attrs: {
          columns: options?.columns || 2,
          gap: options?.gap || "20px",
        },
        content: Array.from({ length: options?.columns || 2 }, () => ({
          type: "container",
          content: [{ type: "paragraph" }],
        })),
      }),
      defaultAttrs: {
        columns: 2,
        gap: "20px",
      },
    });

    blockRegistry.registerBlock({
      type: "video",
      label: "Video",
      category: "media",
      icon: "M4 4l16 8-16 8z",
      create: (options) => ({
        type: "video",
        attrs: {
          src: options?.src || "",
          poster: options?.poster || "",
          autoplay: options?.autoplay || false,
        },
      }),
      defaultAttrs: {
        src: "",
        autoplay: false,
      },
    });

    blockRegistry.registerBlock({
      type: "icon",
      label: "Icon",
      category: "media",
      icon: "M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z",
      create: (options) => ({
        type: "icon",
        attrs: {
          name: options?.name || "star",
          size: options?.size || "24px",
          color: options?.color || "#000000",
        },
      }),
      defaultAttrs: {
        name: "star",
        size: "24px",
        color: "#000000",
      },
    });

    blockRegistry.registerBlock({
      type: "badge",
      label: "Badge",
      category: "typography",
      icon: "M4 8h16v8H4z",
      create: (options) => ({
        type: "badge",
        attrs: {
          text: options?.text || "New",
          variant: options?.variant || "default",
        },
        content: [{ type: "text", text: options?.text || "New" }],
      }),
    });

    blockRegistry.registerBlock({
      type: "alert",
      label: "Alert",
      category: "components",
      icon: "M12 2L2 22h20L12 2zM12 8v4M12 16h.01",
      create: (options) => ({
        type: "alert",
        attrs: {
          variant: options?.variant || "info",
          title: options?.title || "Notice",
        },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: options?.message || "This is an alert message." }],
          },
        ],
      }),
    });

    blockRegistry.registerBlock({
      type: "tabs",
      label: "Tabs",
      category: "components",
      icon: "M4 4h16v16H4zM4 8h16M4 12h16M4 16h16",
      create: (options) => ({
        type: "tabs",
        attrs: {
          tabs: options?.tabs || ["Tab 1", "Tab 2"],
        },
        content: [
          {
            type: "tabPanel",
            attrs: { label: "Tab 1" },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Tab 1 content" }] }],
          },
        ],
      }),
    });

    blockRegistry.registerBlock({
      type: "accordion",
      label: "Accordion",
      category: "components",
      icon: "M4 4h16M4 12h16M4 20h16",
      create: (options) => ({
        type: "accordion",
        attrs: {
          items: options?.items || [{ title: "Section 1", content: "Content here" }],
        },
        content: [
          {
            type: "accordionItem",
            attrs: { title: "Section 1", expanded: true },
            content: [{ type: "paragraph", content: [{ type: "text", text: "Content here" }] }],
          },
        ],
      }),
    });
  },
});

export default UIBlocks;

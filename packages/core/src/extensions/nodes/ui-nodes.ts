import { Node } from "../../sdk/Node";

export const ButtonNode = Node.create({
  name: "button",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      text: { default: "Click me" },
      variant: { default: "primary" },
      href: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "button.ark-button" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { class: customClass, ...rest } = HTMLAttributes;
    return ["button", { ...rest, class: `ark-button ${customClass || ""}`.trim() }];
  },
});

export const CardNode = Node.create({
  name: "card",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      title: { default: "Card Title" },
      padding: { default: "24px" },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-card" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { class: customClass, ...rest } = HTMLAttributes;
    return ["div", { ...rest, class: `ark-card ${customClass || ""}`.trim() }, 0];
  },
});

export const SpacerNode = Node.create({
  name: "spacer",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      height: { default: "40px" },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-spacer" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      { ...HTMLAttributes, class: "ark-spacer", style: `height: ${HTMLAttributes.height}` },
    ];
  },
});

export const DividerNode = Node.create({
  name: "divider",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      style: { default: "solid" },
    };
  },

  parseHTML() {
    return [{ tag: "hr.ark-divider" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["hr", { ...HTMLAttributes, class: "ark-divider" }];
  },
});

export const ContainerNode = Node.create({
  name: "container",
  group: "block container",
  content: "block+",

  addAttributes() {
    return {
      maxWidth: { default: "1200px" },
      padding: { default: "20px" },
      backgroundColor: { default: "transparent" },
      minHeight: { default: "auto" },
      width: { default: "100%" },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-container" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { 
      class: customClass, 
      maxWidth, 
      padding, 
      backgroundColor, 
      minHeight, 
      width,
      ...rest 
    } = HTMLAttributes;
    
    const styles = [
      maxWidth ? `max-width: ${maxWidth}` : "",
      padding ? `padding: ${padding}` : "",
      backgroundColor && backgroundColor !== "transparent" ? `background-color: ${backgroundColor}` : "",
      minHeight && minHeight !== "auto" ? `min-height: ${minHeight}` : "",
      width && width !== "100%" ? `width: ${width}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    
    return [
      "div", 
      { 
        ...rest, 
        class: `ark-container ${customClass || ""}`.trim(),
        style: styles || undefined,
        "data-type": "container"
      }, 
      0
    ];
  },
});

export const GridNode = Node.create({
  name: "grid",
  group: "block",
  content: "container+",

  addAttributes() {
    return {
      columns: { default: 2 },
      gap: { default: "20px" },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-grid" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { class: customClass, ...rest } = HTMLAttributes;
    return ["div", { ...rest, class: `ark-grid ${customClass || ""}`.trim() }, 0];
  },
});

export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: "" },
      poster: { default: "" },
      autoplay: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: "video.ark-video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", { ...HTMLAttributes, class: "ark-video", controls: true }];
  },
});

export const IconNode = Node.create({
  name: "icon",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      name: { default: "star" },
      size: { default: "24px" },
      color: { default: "#000000" },
    };
  },

  parseHTML() {
    return [{ tag: "span.ark-icon" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, class: "ark-icon" }];
  },
});

export const BadgeNode = Node.create({
  name: "badge",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      variant: { default: "default" },
    };
  },

  parseHTML() {
    return [{ tag: "span.ark-badge" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, class: "ark-badge" }];
  },
});

export const AlertNode = Node.create({
  name: "alert",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      variant: { default: "info" },
      title: { default: "Notice" },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-alert" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { class: customClass, ...rest } = HTMLAttributes;
    return [
      "div",
      { ...rest, class: `ark-alert ark-alert-${HTMLAttributes.variant} ${customClass || ""}`.trim() },
      0,
    ];
  },
});

export const TabsNode = Node.create({
  name: "tabs",
  group: "block",
  content: "tabPanel+",

  addAttributes() {
    return {
      tabs: { default: ["Tab 1", "Tab 2"] },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-tabs" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, class: "ark-tabs" }, 0];
  },
});

export const TabPanelNode = Node.create({
  name: "tabPanel",
  group: "block tabPanel",
  content: "block+",

  addAttributes() {
    return {
      label: { default: "Tab" },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-tab-panel" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, class: "ark-tab-panel" }, 0];
  },
});

export const AccordionNode = Node.create({
  name: "accordion",
  group: "block",
  content: "accordionItem+",

  addAttributes() {
    return {
      items: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-accordion" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, class: "ark-accordion" }, 0];
  },
});

export const AccordionItemNode = Node.create({
  name: "accordionItem",
  group: "block accordionItem",
  content: "block+",

  addAttributes() {
    return {
      title: { default: "Section" },
      expanded: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: "div.ark-accordion-item" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", { ...HTMLAttributes, class: "ark-accordion-item" }, 0];
  },
});

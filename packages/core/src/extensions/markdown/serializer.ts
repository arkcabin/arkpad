import { Node as PMNode, Fragment } from "prosemirror-model";

/**
 * A custom serializer to convert ProseMirror nodes back to Markdown.
 */
export class MarkdownSerializer {
  serialize(content: PMNode | Fragment): string {
    let result = "";

    if (content instanceof PMNode) {
      result += this.serializeNode(content);
    } else {
      content.forEach((node) => {
        result += this.serializeNode(node);
      });
    }

    return result.trim();
  }

  private serializeNode(node: PMNode): string {
    switch (node.type.name) {
      case "text":
        return this.serializeText(node);
      case "paragraph":
        return this.serializeChildren(node) + "\n\n";
      case "heading":
        const level = node.attrs.level || 1;
        return "#".repeat(level) + " " + this.serializeChildren(node) + "\n\n";
      case "blockquote":
        return "> " + this.serializeChildren(node).replace(/\n/g, "\n> ") + "\n\n";
      case "bulletList":
        return this.serializeList(node, "- ");
      case "orderedList":
        return this.serializeList(node, (i) => `${i + (node.attrs.order || 1)}. `);
      case "listItem":
      case "taskItem":
        let prefix = "";
        if (node.type.name === "taskItem") {
          prefix = node.attrs.checked ? "[x] " : "[ ] ";
        }
        return prefix + this.serializeChildren(node);
      case "codeBlock":
        return "```\n" + node.textContent + "\n```\n\n";
      case "horizontalRule":
        return "---\n\n";
      case "image":
        const alt = node.attrs.alt || "";
        const src = node.attrs.src || "";
        const title = node.attrs.title ? ` "${node.attrs.title}"` : "";
        return `![${alt}](${src}${title})\n\n`;
      case "hardBreak":
        return "\n";
      default:
        return this.serializeChildren(node);
    }
  }

  private serializeChildren(node: PMNode): string {
    let result = "";
    node.content.forEach((child) => {
      result += this.serializeNode(child);
    });
    return result;
  }

  private serializeText(node: PMNode): string {
    let text = node.text || "";
    
    node.marks.forEach((mark) => {
      switch (mark.type.name) {
        case "strong":
          text = `**${text}**`;
          break;
        case "em":
          text = `*${text}*`;
          break;
        case "strike":
          text = `~~${text}~~`;
          break;
        case "code":
          text = `\`${text}\``;
          break;
        case "link":
          text = `[${text}](${mark.attrs.href}${mark.attrs.title ? ` "${mark.attrs.title}"` : ""})`;
          break;
        case "highlight":
          text = `==${text}==`;
          break;
        case "superscript":
          text = `^${text}^`;
          break;
        case "subscript":
          text = `~${text}~`;
          break;
      }
    });

    return text;
  }

  private serializeList(node: PMNode, marker: string | ((index: number) => string)): string {
    let result = "";
    node.content.forEach((item, i) => {
      const prefix = typeof marker === "function" ? marker(i) : marker;
      const content = this.serializeNode(item);
      result += prefix + content.trim() + "\n";
    });
    return result + "\n";
  }
}

export const defaultMarkdownSerializer = new MarkdownSerializer();

import { PageConfig, NormalizedPageConfig } from "./types";
import { blockRegistry } from "./registry";

/**
 * Serializes the page config into a pretty-printed JSON string.
 */
export const exportToJSON = (config: PageConfig | NormalizedPageConfig): string => {
  return JSON.stringify(config, null, 2);
};

/**
 * Serializes the page config and block properties into a clean Markdown document.
 */
export const exportToMarkdown = (config: PageConfig | NormalizedPageConfig): string => {
  let markdown = "";

  // If normalized, denormalize it first
  let blocks: any[] = [];

  if ("rootIds" in config && "blocks" in config && !Array.isArray(config.blocks)) {
    const flatBlocks = config.blocks as Record<string, any>;
    const rootIds = config.rootIds as string[];
    
    const hydrate = (id: string): any => {
      const block = flatBlocks[id];
      if (!block) return null;
      const children = (block.children || []).map((cid: string) => hydrate(cid)).filter(Boolean);
      return {
        ...block,
        children: children.length > 0 ? children : undefined,
      };
    };
    blocks = rootIds.map(hydrate).filter(Boolean);
  } else if ("blocks" in config && Array.isArray(config.blocks)) {
    blocks = config.blocks;
  }

  const renderBlock = (block: any, depth: number = 0): string => {
    let result = "";
    const configDef = blockRegistry.get(block.type);
    if (!configDef) return "";

    const indent = "  ".repeat(depth);
    
    // Custom formatting depending on type:
    if (block.type === "header") {
      const text = block.props?.text || "Header";
      const level = block.props?.level || 1;
      const hashes = "#".repeat(Math.min(6, level));
      result += `\n${indent}${hashes} ${text}\n`;
    } else if (block.type === "text" || block.type === "text-editor") {
      const content = block.props?.content || block.props?.html || "";
      result += `\n${indent}${content}\n`;
    } else if (block.type === "button") {
      const label = block.props?.label || "Button";
      result += `\n${indent}[${label}]\n`;
    } else {
      result += `\n${indent}<!-- Block: ${configDef.name} -->\n`;
      if (block.props && Object.keys(block.props).length > 0) {
        Object.entries(block.props).forEach(([key, val]) => {
          result += `${indent}- **${key}**: ${typeof val === "object" ? JSON.stringify(val) : val}\n`;
        });
      }
    }

    if (block.children && Array.isArray(block.children)) {
      block.children.forEach((child: any) => {
        result += renderBlock(child, depth + 1);
      });
    }

    return result;
  };

  blocks.forEach((block) => {
    markdown += renderBlock(block, 0);
  });

  return markdown.trim();
};

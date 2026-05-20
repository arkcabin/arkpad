import { LayoutJSON } from "./types";
import { blockRegistry } from "./registry";

/**
 * Serializes the builder layout into a pretty-printed JSON string.
 */
export const exportToJSON = (layout: LayoutJSON): string => {
  return JSON.stringify(layout, null, 2);
};

/**
 * Serializes the builder layout and block properties into a clean Markdown document.
 */
export const exportToMarkdown = (layout: LayoutJSON): string => {
  let markdown = "";

  layout.rows.forEach((row, rowIndex) => {
    const colCount = row.columns.length;

    if (colCount > 1) {
      markdown += `\n<!-- Section Start: Row with ${colCount} columns -->\n`;
    }

    row.columns.forEach((col, colIndex) => {
      if (colCount > 1) {
        markdown += `\n<!-- Column ${colIndex + 1} (Width: ${col.width}/12) -->\n`;
      }

      col.blocks.forEach((block) => {
        const config = blockRegistry.get(block.type);
        if (!config) return;

        // Custom formatting depending on registered type:
        if (block.type === "rich-text") {
          const content = block.properties.markdown || block.properties.content || "";
          markdown += `\n${content}\n`;
        } else if (block.type === "metric-card") {
          const title = block.properties.title || "Metric";
          const value = block.properties.value || "0";
          const change = block.properties.change || "";
          const trend = block.properties.trend === "up" ? "▲" : block.properties.trend === "down" ? "▼" : "";

          markdown += `\n> **${title}**\n> # ${value}\n> *${change} ${trend}*\n`;
        } else if (block.type === "chart") {
          const title = block.properties.title || "Analytics Chart";
          const chartType = block.properties.chartType || "bar";
          markdown += `\n### 📊 ${title} (${chartType.toUpperCase()} Chart)\n*(Interactive chart rendering in dashboard)*\n`;
        } else {
          // Dynamic fallback for custom registered blocks
          markdown += `\n### [Block: ${config.name}]\n`;
          Object.entries(block.properties).forEach(([key, val]) => {
            markdown += `* **${key}**: ${JSON.stringify(val)}\n`;
          });
        }
      });
    });

    if (colCount > 1) {
      markdown += `\n<!-- Section End -->\n`;
    }
  });

  return markdown.trim();
};

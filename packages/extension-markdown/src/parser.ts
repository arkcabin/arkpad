/**
 * A robust state-based markdown-to-html converter.
 * Handles headings, lists, blockquotes, bold, italic, links, images,
 * and block-level patterns like fenced code blocks and markdown tables.
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const processedLines: string[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();

    // 1. Fenced Code Blocks (```lang)
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith("```")) {
        codeLines.push(lines[i]!);
        i++;
      }
      i++; // skip closing ```

      const escapedCode = codeLines
        .join("\n")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const codeClass = lang ? ` class="language-${lang}"` : "";
      processedLines.push(`<pre><code${codeClass}>${escapedCode}</code></pre>`);
      continue;
    }

    // 2. Tables (| Col 1 | Col 2 |)
    if (trimmed.startsWith("|")) {
      const nextLine = lines[i + 1]?.trim();
      if (nextLine && nextLine.startsWith("|") && nextLine.replace(/[\s|:-]/g, "") === "") {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i]!.trim().startsWith("|")) {
          tableLines.push(lines[i]!);
          i++;
        }

        if (tableLines.length >= 2) {
          const headerLine = tableLines[0]!;
          const dataLines = tableLines.slice(2); // skip separator line

          const parseRow = (rowText: string) => {
            const cells = rowText.split("|").map((c) => c.trim());
            if (rowText.trim().startsWith("|")) cells.shift();
            if (rowText.trim().endsWith("|")) cells.pop();
            return cells;
          };

          const headers = parseRow(headerLine);
          const thead = `<thead><tr>${headers.map((h) => `<th><p>${inlineMarkdownToHtml(h)}</p></th>`).join("")}</tr></thead>`;

          const rowsHtml = dataLines
            .map((rowLine) => {
              const cells = parseRow(rowLine);
              while (cells.length < headers.length) cells.push("");
              cells.length = headers.length;
              return `<tr>${cells.map((c) => `<td><p>${inlineMarkdownToHtml(c)}</p></td>`).join("")}</tr>`;
            })
            .join("");

          processedLines.push(`<table>${thead}<tbody>${rowsHtml}</tbody></table>`);
          continue;
        }
      }
    }

    // 3. Horizontal Rule
    if (/^(?:---|___|\*\*\*)$/.test(trimmed)) {
      processedLines.push("<hr />");
      i++;
      continue;
    }

    // 4. Headings
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const content = headingMatch[2]!;
      processedLines.push(`<h${level}>${inlineMarkdownToHtml(content)}</h${level}>`);
      i++;
      continue;
    }

    // 5. Blockquotes
    if (trimmed.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith("> ")) {
        quoteLines.push(lines[i]!.trim().slice(2));
        i++;
      }
      processedLines.push(
        `<blockquote><p>${inlineMarkdownToHtml(quoteLines.join(" "))}</p></blockquote>`
      );
      continue;
    }

    // 6. Bullet Lists
    if (/^[*+-]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^[*+-]\s+/.test(lines[i]!.trim())) {
        listItems.push(lines[i]!.trim().replace(/^[*+-]\s+/, ""));
        i++;
      }
      processedLines.push(
        `<ul>${listItems.map((item) => `<li><p>${inlineMarkdownToHtml(item)}</p></li>`).join("")}</ul>`
      );
      continue;
    }

    // 7. Ordered Lists
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i]!.trim())) {
        listItems.push(lines[i]!.trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      processedLines.push(
        `<ol>${listItems.map((item) => `<li><p>${inlineMarkdownToHtml(item)}</p></li>`).join("")}</ol>`
      );
      continue;
    }

    // 8. Normal Paragraph
    if (trimmed.length > 0) {
      processedLines.push(`<p>${inlineMarkdownToHtml(line)}</p>`);
    } else {
      processedLines.push("");
    }
    i++;
  }

  return processedLines.join("\n");
}

function inlineMarkdownToHtml(text: string): string {
  let html = text;

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)(?:\s"(.*?)")?\)/g, '<img src="$2" alt="$1" title="$3" />');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)(?:\s"(.*?)")?\)/g, '<a href="$2" title="$3">$1</a>');

  // Bold/Italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Highlight
  html = html.replace(/==(.*?)==/g, "<mark>$1</mark>");

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, "<strike>$1</strike>");

  // Inline Code
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  return html;
}

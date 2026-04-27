/**
 * A simple markdown-to-html converter.
 * Handles common patterns like headings, lists, bold, italic, links, and images.
 */
export function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Horizontal Rule
  html = html.replace(/^(?:---|___|\*\*\*)$/gm, "<hr />");

  // Headings
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
  html = html.replace(/^##### (.*$)/gim, "<h5>$1</h5>");
  html = html.replace(/^###### (.*$)/gim, "<h6>$1</h6>");

  // Images: ![alt](url "title")
  html = html.replace(/!\[(.*?)\]\((.*?)(?:\s"(.*?)")?\)/g, '<img src="$2" alt="$1" title="$3" />');

  // Links: [text](url "title")
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

  // Blockquotes (simple check for start of line)
  html = html.replace(/^> (.*$)/gim, "<blockquote><p>$1</p></blockquote>");
  // Merge consecutive blockquotes
  html = html.replace(/<\/blockquote><blockquote>/g, "");

  // Lists (Bullet)
  html = html.replace(/^[\*\+-] (.*$)/gim, "<ul><li><p>$1</p></li></ul>");
  // Lists (Ordered)
  html = html.replace(/^\d+\. (.*$)/gim, "<ol><li><p>$1</p></li></ol>");
  
  // Merge consecutive lists of same type
  html = html.replace(/<\/ul><ul>/g, "");
  html = html.replace(/<\/ol><ol>/g, "");

  // Paragraphs (for lines that are not already tagged)
  html = html.split("\n").map(line => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return "";
    if (trimmed.startsWith("<") && (trimmed.endsWith(">") || trimmed.includes("/>"))) return line;
    return `<p>${line}</p>`;
  }).join("");

  return html;
}

/**
 * Utility to convert rich text from Google Docs (and Word / Notion / web)
 * into high-fidelity formatted Markdown while preserving styles:
 * - Headings (H1, H2, H3, H4, Title, Subtitle, font-size heuristics)
 * - Bold, Italic, Strikethrough, Underline
 * - Bullet lists & Numbered lists (with nested indentation)
 * - Hyperlinks (including unwrapping Google Docs redirection URLs)
 * - Tables (HTML table -> clean Markdown table)
 * - Blockquotes
 * - Code blocks and inline code
 * - Images
 */

/**
 * Clean Google redirect URL:
 * https://www.google.com/url?q=https%3A%2F%2Fgithub.com&sa=D&... -> https://github.com
 */
function cleanGoogleDocsUrl(url: string): string {
  if (!url) return "";
  try {
    if (url.includes("google.com/url?") || url.includes("google.com/url/")) {
      const parsed = new URL(url);
      const target = parsed.searchParams.get("q") || parsed.searchParams.get("url");
      if (target) {
        return decodeURIComponent(target);
      }
    }
  } catch {
    // Return original url if parsing fails
  }
  return url;
}

/**
 * Parse font size in pt or px from style attribute
 */
function parseFontSizePt(styleStr: string): number | null {
  const matchPt = styleStr.match(/font-size:\s*([\d.]+)pt/i);
  if (matchPt) return parseFloat(matchPt[1]);
  const matchPx = styleStr.match(/font-size:\s*([\d.]+)px/i);
  if (matchPx) return parseFloat(matchPx[1]) * 0.75; // approx px to pt
  return null;
}

/**
 * Check if node or style is bold
 */
function isBoldStyle(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "b" || tag === "strong") return true;
  const fw = el.style.fontWeight;
  if (fw === "bold" || fw === "700" || fw === "800" || fw === "900") return true;
  return false;
}

/**
 * Check if node or style is italic
 */
function isItalicStyle(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "i" || tag === "em") return true;
  const fs = el.style.fontStyle;
  if (fs === "italic") return true;
  return false;
}

/**
 * Check if node or style has underline
 */
function isUnderlineStyle(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "u") return true;
  const td = el.style.textDecoration;
  return td.includes("underline");
}

/**
 * Check if node or style has strikethrough
 */
function isStrikeStyle(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "s" || tag === "strike" || tag === "del") return true;
  const td = el.style.textDecoration;
  return td.includes("line-through");
}

/**
 * Check if node is code / monospace
 */
function isCodeStyle(el: HTMLElement): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "code" || tag === "kbd" || tag === "samp" || tag === "tt") return true;
  const ff = el.style.fontFamily.toLowerCase();
  return (
    ff.includes("courier") ||
    ff.includes("consolas") ||
    ff.includes("monospace") ||
    ff.includes("source code pro") ||
    ff.includes("fira code")
  );
}

/**
 * Traverse inline formatting for text nodes
 */
function processInlineNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // Line breaks
  if (tag === "br") {
    return "\n";
  }

  // Images
  if (tag === "img") {
    const src = el.getAttribute("src") || "";
    const alt = el.getAttribute("alt") || el.getAttribute("title") || "Image";
    if (src) {
      return `![${alt}](${src})`;
    }
    return "";
  }

  // Links
  if (tag === "a") {
    const rawHref = el.getAttribute("href") || "";
    const href = cleanGoogleDocsUrl(rawHref);
    const linkText = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    if (href && linkText) {
      return `[${linkText}](${href})`;
    } else if (href) {
      return `<${href}>`;
    }
    return linkText;
  }

  // Recurse children
  let text = Array.from(el.childNodes).map(processInlineNode).join("");

  if (!text) return "";

  // Apply inline styles
  const bold = isBoldStyle(el);
  const italic = isItalicStyle(el);
  const strike = isStrikeStyle(el);
  const underline = isUnderlineStyle(el);
  const code = isCodeStyle(el);

  // Avoid wrapping pure whitespace in markdown symbols
  if (!text.trim()) {
    return text;
  }

  // Extract leading/trailing spaces so ** bold ** doesn't break markdown parsers
  const leadMatch = text.match(/^(\s*)/);
  const trailMatch = text.match(/(\s*)$/);
  const leadSpace = leadMatch ? leadMatch[1] : "";
  const trailSpace = trailMatch ? trailMatch[1] : "";
  let inner = text.trim();

  if (code && !inner.includes("\n")) {
    inner = `\`${inner}\``;
  }
  if (bold) {
    inner = `**${inner}**`;
  }
  if (italic) {
    inner = `*${inner}*`;
  }
  if (strike) {
    inner = `~~${inner}~~`;
  }
  if (underline && !bold) {
    inner = `<u>${inner}</u>`;
  }

  return `${leadSpace}${inner}${trailSpace}`;
}

/**
 * Convert HTML Table to Markdown Table
 */
function convertTableToMarkdown(tableEl: HTMLElement): string {
  const rows: string[][] = [];
  const trElements = Array.from(tableEl.querySelectorAll("tr"));

  if (trElements.length === 0) return "";

  trElements.forEach((tr) => {
    const cells = Array.from(tr.querySelectorAll("th, td"));
    const rowData: string[] = cells.map((cell) => {
      const text = Array.from(cell.childNodes)
        .map(processInlineNode)
        .join("")
        .replace(/\n+/g, " ")
        .replace(/\|/g, "\\|")
        .trim();
      return text || " ";
    });
    if (rowData.length > 0) {
      rows.push(rowData);
    }
  });

  if (rows.length === 0) return "";

  // Normalize column count
  const maxCols = Math.max(...rows.map((r) => r.length));
  if (maxCols === 0) return "";

  const normalizedRows = rows.map((r) => {
    const filled = [...r];
    while (filled.length < maxCols) filled.push(" ");
    return filled;
  });

  const header = normalizedRows[0];
  const separator = new Array(maxCols).fill("---");
  const dataRows = normalizedRows.slice(1);

  let md = `\n| ${header.join(" | ")} |\n`;
  md += `| ${separator.join(" | ")} |\n`;

  if (dataRows.length > 0) {
    dataRows.forEach((row) => {
      md += `| ${row.join(" | ")} |\n`;
    });
  }

  return `\n${md}\n`;
}

/**
 * Convert an HTML element / block node into Markdown
 */
function processBlockNode(node: Node, listDepth = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const txt = node.textContent?.trim();
    return txt ? `${txt}\n\n` : "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  // Discard metadata, styles, scripts
  if (tag === "style" || tag === "script" || tag === "meta" || tag === "title") {
    return "";
  }

  // Headings
  if (tag === "h1") {
    const text = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    return text ? `\n# ${text}\n\n` : "";
  }
  if (tag === "h2") {
    const text = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    return text ? `\n## ${text}\n\n` : "";
  }
  if (tag === "h3") {
    const text = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    return text ? `\n### ${text}\n\n` : "";
  }
  if (tag === "h4") {
    const text = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    return text ? `\n#### ${text}\n\n` : "";
  }
  if (tag === "h5" || tag === "h6") {
    const text = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    return text ? `\n##### ${text}\n\n` : "";
  }

  // Horizontal Rule
  if (tag === "hr") {
    return "\n---\n\n";
  }

  // Preformatted Code
  if (tag === "pre") {
    const codeText = el.textContent || "";
    return `\n\`\`\`\n${codeText.trim()}\n\`\`\`\n\n`;
  }

  // Blockquote
  if (tag === "blockquote") {
    const quoteText = Array.from(el.childNodes)
      .map(processInlineNode)
      .join("")
      .trim();
    const lines = quoteText.split("\n").map((l) => `> ${l}`).join("\n");
    return `\n${lines}\n\n`;
  }

  // Tables
  if (tag === "table") {
    return convertTableToMarkdown(el);
  }

  // Unordered list
  if (tag === "ul") {
    const items: string[] = [];
    Array.from(el.children).forEach((child) => {
      if (child.tagName.toLowerCase() === "li") {
        const indent = "  ".repeat(listDepth);
        const itemContent = Array.from(child.childNodes)
          .map((c) => {
            if (c.nodeType === Node.ELEMENT_NODE && ["ul", "ol"].includes((c as HTMLElement).tagName.toLowerCase())) {
              return "\n" + processBlockNode(c, listDepth + 1);
            }
            return processInlineNode(c);
          })
          .join("")
          .trim();
        if (itemContent) {
          items.push(`${indent}- ${itemContent}`);
        }
      }
    });
    return `\n${items.join("\n")}\n\n`;
  }

  // Ordered list
  if (tag === "ol") {
    const items: string[] = [];
    let counter = 1;
    Array.from(el.children).forEach((child) => {
      if (child.tagName.toLowerCase() === "li") {
        const indent = "  ".repeat(listDepth);
        const itemContent = Array.from(child.childNodes)
          .map((c) => {
            if (c.nodeType === Node.ELEMENT_NODE && ["ul", "ol"].includes((c as HTMLElement).tagName.toLowerCase())) {
              return "\n" + processBlockNode(c, listDepth + 1);
            }
            return processInlineNode(c);
          })
          .join("")
          .trim();
        if (itemContent) {
          items.push(`${indent}${counter}. ${itemContent}`);
          counter++;
        }
      }
    });
    return `\n${items.join("\n")}\n\n`;
  }

  // List item outside of ul/ol (Google Docs sometimes formats like this)
  if (tag === "li") {
    const text = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    return text ? `- ${text}\n` : "";
  }

  // Paragraphs or Divs
  if (tag === "p" || tag === "div") {
    // Check if Google Docs styled this paragraph as a heading using font-size and weight
    const styleAttr = el.getAttribute("style") || "";
    const fontSize = parseFontSizePt(styleAttr);
    const hasBold = isBoldStyle(el);

    const inlineContent = Array.from(el.childNodes).map(processInlineNode).join("").trim();
    if (!inlineContent) {
      return "";
    }

    // Heuristics for Google Docs Title and Heading styles:
    // H1 / Title: fontSize >= 20pt or has class 'title'
    // H2: fontSize >= 16pt or has class 'subtitle' or (fontSize >= 15pt && bold)
    // H3: fontSize >= 13pt && bold
    const classList = (el.getAttribute("class") || "").toLowerCase();

    if (classList.includes("title") || (fontSize && fontSize >= 21)) {
      // Remove double bold if it was wrapped
      const clean = inlineContent.replace(/^\*\*(.*)\*\*$/, "$1");
      return `\n# ${clean}\n\n`;
    }

    if (classList.includes("subtitle") || (fontSize && fontSize >= 16 && (hasBold || inlineContent.startsWith("**")))) {
      const clean = inlineContent.replace(/^\*\*(.*)\*\*$/, "$1");
      return `\n## ${clean}\n\n`;
    }

    if (fontSize && fontSize >= 13 && (hasBold || inlineContent.startsWith("**"))) {
      const clean = inlineContent.replace(/^\*\*(.*)\*\*$/, "$1");
      return `\n### ${clean}\n\n`;
    }

    // Standard paragraph
    return `${inlineContent}\n\n`;
  }

  // Generic containers: recurse children
  const result = Array.from(el.childNodes)
    .map((c) => processBlockNode(c, listDepth))
    .join("");
  return result;
}

/**
 * Clean up redundant blank lines and normalized markdown
 */
function cleanMarkdown(md: string): string {
  return md
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Main function: Convert raw HTML (from Google Docs clipboard or any rich source)
 * into clean formatted Markdown
 */
export function convertHtmlToMarkdown(htmlString: string): string {
  if (!htmlString || !htmlString.trim()) {
    return "";
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const body = doc.body;

    if (!body) return "";

    const rawMd = Array.from(body.childNodes)
      .map((node) => processBlockNode(node, 0))
      .join("");

    return cleanMarkdown(rawMd);
  } catch (err) {
    console.error("Error converting HTML to Markdown:", err);
    return "";
  }
}

/**
 * Handle clipboard paste event:
 * Inspects DataTransfer for rich HTML (Google Docs, Word, web).
 * Returns converted markdown if rich formatting was detected.
 */
export function handleGoogleDocsPaste(clipboardData: DataTransfer): {
  content: string;
  isRichContent: boolean;
  detectedSource: "google-docs" | "word" | "rich-html" | "plain-text";
} {
  const html = clipboardData.getData("text/html");
  const plainText = clipboardData.getData("text/plain");

  if (!html) {
    return {
      content: plainText,
      isRichContent: false,
      detectedSource: "plain-text",
    };
  }

  // Detect Google Docs signature
  const isGoogleDocs =
    html.includes("docs-internal-guid") ||
    html.includes("google-sheets-html-origin") ||
    html.includes('id="docs-internal-guid') ||
    html.includes("font-family:Arial;color:#000000;background-color:transparent");

  // Detect MS Word signature
  const isWord =
    html.includes("urn:schemas-microsoft-com:office") ||
    html.includes("mso-") ||
    html.includes("WordDocument");

  // Convert HTML to Markdown
  const markdown = convertHtmlToMarkdown(html);

  // If conversion yielded meaningful markdown with formatting
  if (markdown && markdown.length > 0) {
    return {
      content: markdown,
      isRichContent: true,
      detectedSource: isGoogleDocs ? "google-docs" : isWord ? "word" : "rich-html",
    };
  }

  // Fallback to plain text
  return {
    content: plainText,
    isRichContent: false,
    detectedSource: "plain-text",
  };
}

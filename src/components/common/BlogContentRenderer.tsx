import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface BlogContentRendererProps {
  content: string;
  theme?: "light" | "dark";
  className?: string;
}

export const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({
  content,
  theme = "light",
  className = "",
}) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    });
  };

  // Helper for inline markdown: **bold**, *italic*, `code`, ~~strike~~, <u>underline</u>, [link](url)
  const renderInline = (text: string): React.ReactNode => {
    // Regex matching bold, code, strikethrough, underline, links, or italic
    const regex = /(\*\*.*?\*\*|`.*?`|~~.*?~~|<u>.*?<\/u>|\[.*?\]\(.*?\)|\*.*?\*)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (!part) return null;

      // Bold: **text**
      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        return (
          <strong
            key={i}
            className={`font-bold ${theme === "dark" ? "text-white" : "text-neutral-950"}`}
          >
            {part.slice(2, -2)}
          </strong>
        );
      }

      // Inline code: `text`
      if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
        return (
          <code
            key={i}
            className={`px-1.5 py-0.5 mx-0.5 rounded font-mono text-xs sm:text-sm border ${
              theme === "dark"
                ? "bg-neutral-800 text-blue-300 border-neutral-700"
                : "bg-neutral-100 text-neutral-900 border-neutral-200"
            }`}
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      // Strikethrough: ~~text~~
      if (part.startsWith("~~") && part.endsWith("~~") && part.length >= 4) {
        return (
          <del
            key={i}
            className={`line-through ${
              theme === "dark" ? "text-neutral-500" : "text-neutral-400"
            }`}
          >
            {part.slice(2, -2)}
          </del>
        );
      }

      // Underline: <u>text</u>
      if (part.startsWith("<u>") && part.endsWith("</u>") && part.length >= 7) {
        return (
          <u
            key={i}
            className="underline underline-offset-2 decoration-neutral-400"
          >
            {part.slice(3, -4)}
          </u>
        );
      }

      // Links: [text](url)
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        return (
          <a
            key={i}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 font-medium transition-colors ${
              theme === "dark"
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            {linkText}
          </a>
        );
      }

      // Italic: *text*
      if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
        return (
          <em
            key={i}
            className={`italic ${
              theme === "dark" ? "text-neutral-300" : "text-neutral-800"
            }`}
          >
            {part.slice(1, -1)}
          </em>
        );
      }

      return part;
    });
  };

  // Render markdown lines into formatted blocks
  const renderContent = () => {
    const rawLines = content.split("\n");
    const blocks: React.ReactNode[] = [];

    let inCode = false;
    let codeLanguage = "";
    let codeLines: string[] = [];
    let codeBlockIndex = 0;

    let inTable = false;
    let tableLines: string[] = [];

    const flushTable = (keyIndex: number) => {
      if (tableLines.length === 0) return;

      const rows = tableLines.map((l) =>
        l
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim())
      );

      // Filter out markdown separator line (e.g. |---|---|)
      const headerRow = rows[0] || [];
      const dataRows = rows.slice(1).filter((r) => {
        const joined = r.join("");
        return !/^[-:\s]+$/.test(joined);
      });

      blocks.push(
        <div
          key={`table-${keyIndex}`}
          className={`my-6 overflow-x-auto rounded-xl border shadow-sm ${
            theme === "dark"
              ? "border-neutral-800 bg-neutral-900/60"
              : "border-neutral-200 bg-white"
          }`}
        >
          <table className="w-full text-left text-sm border-collapse">
            {headerRow.length > 0 && (
              <thead>
                <tr
                  className={`border-b ${
                    theme === "dark"
                      ? "border-neutral-800 bg-neutral-900 text-neutral-200"
                      : "border-neutral-200 bg-neutral-50 text-neutral-800"
                  }`}
                >
                  {headerRow.map((cell, cIdx) => (
                    <th
                      key={cIdx}
                      className="px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                    >
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody
              className={`divide-y ${
                theme === "dark"
                  ? "divide-neutral-800/80 text-neutral-300"
                  : "divide-neutral-100 text-neutral-700"
              }`}
            >
              {dataRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`transition-colors ${
                    theme === "dark"
                      ? "hover:bg-neutral-800/40"
                      : "hover:bg-neutral-50/80"
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-xs sm:text-sm">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

      inTable = false;
      tableLines = [];
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      // Check Table
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        inTable = true;
        tableLines.push(trimmed);
        continue;
      } else if (inTable) {
        flushTable(i);
      }

      // Check Code Block ```
      if (trimmed.startsWith("```")) {
        if (inCode) {
          const currentCodeIdx = codeBlockIndex++;
          const joinedCode = codeLines.join("\n");
          blocks.push(
            <div
              key={`code-${i}`}
              className="my-6 rounded-2xl bg-neutral-950 p-5 border border-neutral-800 text-neutral-100 font-mono text-xs sm:text-sm overflow-x-auto relative group shadow-md"
            >
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-800 text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                <span>{codeLanguage || "code"}</span>
                <button
                  type="button"
                  onClick={() => handleCopyCode(joinedCode, currentCodeIdx)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors text-[10px] lowercase"
                >
                  {copiedCodeIdx === currentCodeIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="leading-relaxed">
                <code>{joinedCode}</code>
              </pre>
            </div>
          );
          inCode = false;
          codeLines = [];
          codeLanguage = "";
        } else {
          inCode = true;
          codeLanguage = trimmed.slice(3).trim();
          codeLines = [];
        }
        continue;
      }

      if (inCode) {
        codeLines.push(line);
        continue;
      }

      // Horizontal Rule
      if (trimmed === "---") {
        blocks.push(
          <hr
            key={`hr-${i}`}
            className={`my-10 ${
              theme === "dark" ? "border-neutral-800" : "border-neutral-200"
            }`}
          />
        );
        continue;
      }

      // Headings
      if (trimmed.startsWith("# ")) {
        blocks.push(
          <h1
            key={`h1-${i}`}
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-space mt-10 mb-4 ${
              theme === "dark" ? "text-white" : "text-neutral-950"
            }`}
          >
            {renderInline(trimmed.replace(/^#\s+/, ""))}
          </h1>
        );
        continue;
      }

      if (trimmed.startsWith("## ")) {
        blocks.push(
          <h2
            key={`h2-${i}`}
            className={`text-xl sm:text-2xl font-bold tracking-tight font-space mt-9 mb-3.5 pt-3 border-t first:border-0 first:mt-0 ${
              theme === "dark"
                ? "text-neutral-100 border-neutral-800/80"
                : "text-neutral-950 border-neutral-100"
            }`}
          >
            {renderInline(trimmed.replace(/^##\s+/, ""))}
          </h2>
        );
        continue;
      }

      if (trimmed.startsWith("### ")) {
        blocks.push(
          <h3
            key={`h3-${i}`}
            className={`text-lg sm:text-xl font-bold tracking-tight font-space mt-7 mb-2.5 ${
              theme === "dark" ? "text-neutral-200" : "text-neutral-900"
            }`}
          >
            {renderInline(trimmed.replace(/^###\s+/, ""))}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith("#### ")) {
        blocks.push(
          <h4
            key={`h4-${i}`}
            className={`text-base sm:text-lg font-bold tracking-tight font-space mt-5 mb-2 ${
              theme === "dark" ? "text-neutral-300" : "text-neutral-800"
            }`}
          >
            {renderInline(trimmed.replace(/^####\s+/, ""))}
          </h4>
        );
        continue;
      }

      if (trimmed.startsWith("##### ")) {
        blocks.push(
          <h5
            key={`h5-${i}`}
            className={`text-sm sm:text-base font-semibold uppercase tracking-wider mt-4 mb-2 ${
              theme === "dark" ? "text-neutral-400" : "text-neutral-700"
            }`}
          >
            {renderInline(trimmed.replace(/^#####\s+/, ""))}
          </h5>
        );
        continue;
      }

      // Blockquotes
      if (trimmed.startsWith("> ")) {
        blocks.push(
          <blockquote
            key={`quote-${i}`}
            className={`my-5 pl-5 border-l-4 italic py-2.5 rounded-r-xl text-base ${
              theme === "dark"
                ? "border-blue-500 bg-neutral-900/80 text-neutral-300"
                : "border-neutral-900 bg-neutral-50 text-neutral-700"
            }`}
          >
            {renderInline(trimmed.replace(/^>\s+/, ""))}
          </blockquote>
        );
        continue;
      }

      // Bullet List
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const text = trimmed.slice(2);
        blocks.push(
          <li
            key={`li-${i}`}
            className={`ml-6 list-disc leading-relaxed my-1.5 text-base sm:text-lg ${
              theme === "dark" ? "text-neutral-300" : "text-neutral-700"
            }`}
          >
            {renderInline(text)}
          </li>
        );
        continue;
      }

      // Numbered List
      if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s/, "");
        blocks.push(
          <li
            key={`oli-${i}`}
            className={`ml-6 list-decimal leading-relaxed my-1.5 text-base sm:text-lg ${
              theme === "dark" ? "text-neutral-300" : "text-neutral-700"
            }`}
          >
            {renderInline(text)}
          </li>
        );
        continue;
      }

      // Markdown Images: ![alt](url)
      const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imageMatch) {
        const altText = imageMatch[1];
        const imageUrl = imageMatch[2];
        blocks.push(
          <figure
            key={`img-${i}`}
            className={`my-8 rounded-2xl overflow-hidden border shadow-sm ${
              theme === "dark"
                ? "border-neutral-800 bg-neutral-950"
                : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <img
              src={imageUrl}
              alt={altText}
              className="w-full h-auto object-cover max-h-[540px]"
              loading="lazy"
            />
            {altText && (
              <figcaption
                className={`text-center text-xs py-2.5 px-4 font-mono border-t ${
                  theme === "dark"
                    ? "text-neutral-400 bg-neutral-900 border-neutral-800"
                    : "text-neutral-500 bg-neutral-100/80 border-neutral-200/60"
                }`}
              >
                {altText}
              </figcaption>
            )}
          </figure>
        );
        continue;
      }

      // Empty Lines
      if (!trimmed) {
        continue;
      }

      // Standard Paragraph
      blocks.push(
        <p
          key={`p-${i}`}
          className={`my-3.5 text-base sm:text-lg leading-relaxed font-normal ${
            theme === "dark" ? "text-neutral-300" : "text-neutral-700"
          }`}
        >
          {renderInline(line)}
        </p>
      );
    }

    // Flush any pending table at the end
    if (inTable) {
      flushTable(rawLines.length);
    }

    return blocks;
  };

  return (
    <div
      className={`prose-content max-w-none font-sans leading-relaxed ${className}`}
    >
      {renderContent()}
    </div>
  );
};

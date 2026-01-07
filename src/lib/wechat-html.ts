const STYLE = {
  section: "margin:0;padding:0;background-color:#ffffff;",
  p:
    "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);" +
    "margin: 0px 16px 12px;" +
    "padding: 0px;" +
    "outline: 0px;" +
    "max-width: 100%;" +
    "clear: both;" +
    "min-height: 1em;" +
    "color: rgba(0, 0, 0, 0.9);" +
    "font-family: \"PingFang SC\", system-ui, -apple-system, \"Helvetica Neue\", \"Hiragino Sans GB\", \"Microsoft YaHei UI\", \"Microsoft YaHei\", Arial, sans-serif;" +
    "font-size: 17px;" +
    "font-style: normal;" +
    "font-variant-ligatures: normal;" +
    "font-variant-caps: normal;" +
    "font-weight: 400;" +
    "letter-spacing: 0.544px;" +
    "orphans: 2;" +
    "text-align: justify;" +
    "text-indent: 0px;" +
    "text-transform: none;" +
    "widows: 2;" +
    "word-spacing: 0px;" +
    "-webkit-text-stroke-width: 0px;" +
    "white-space: normal;" +
    "text-decoration-thickness: initial;" +
    "text-decoration-style: initial;" +
    "text-decoration-color: initial;" +
    "background-color: rgb(255, 255, 255);" +
    "visibility: visible;" +
    "line-height: 1.6em;" +
    "box-sizing: border-box !important;" +
    "overflow-wrap: break-word !important;",
  headingWrap:
    "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);" +
    "margin: 0px 16px 12px;" +
    "padding: 0px;" +
    "outline: 0px;" +
    "max-width: 100%;" +
    "clear: both;" +
    "min-height: 1em;" +
    "font-weight: bold;" +
    "caret-color: rgb(74, 74, 74);" +
    "color: rgb(102, 102, 102);" +
    "font-size: 16px;" +
    "letter-spacing: 1px;" +
    "background-color: rgb(255, 255, 255);" +
    "box-sizing: border-box !important;" +
    "overflow-wrap: break-word !important;",
  headingText: "font-size: 18px;letter-spacing: 2px;color: rgb(11, 139, 102);",
  headingTextSmall:
    "font-size: 17px;letter-spacing: 1px;color: rgb(11, 139, 102);",
  ul: "margin: 0px 16px 12px;padding-left: 18px;line-height: 1.6em;text-align: justify;",
  ol: "margin: 0px 16px 12px;padding-left: 18px;line-height: 1.6em;text-align: justify;",
  li: "margin: 4px 0px;",
  blockquote:
    "margin: 0px 16px 12px;padding: 10px 12px;background: #f5f5f5;border-left: 3px solid #e0e0e0;color: #666666;font-size: 16px;line-height: 1.6em;",
  imgWrap: "margin: 0px 16px 12px;line-height: 1.6em;text-align: justify;",
  img: "width: 100%;height: auto;display: block;margin: 0 auto;",
  strong: "font-weight: 700;color: rgb(51, 51, 51);",
  code:
    "background: #f3f3f3;border-radius: 4px;padding: 2px 4px;font-size: 13px;font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;",
  link: "color: rgb(11, 139, 102);text-decoration: underline;",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/\"/g, "&quot;");
}

function renderInline(text: string) {
  const placeholders: string[] = [];
  const stash = (html: string) => {
    const index = placeholders.length;
    placeholders.push(html);
    return `%%PLACEHOLDER_${index}%%`;
  };

  let output = text;
  output = output.replace(
    /`([^`]+)`/g,
    (_match, code) =>
      stash(`<code style="${STYLE.code}">${escapeHtml(code)}</code>`)
  );
  output = output.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label, url) =>
      stash(
        `<a href="${escapeAttribute(url)}" style="${STYLE.link}">${escapeHtml(
          label
        )}</a>`
      )
  );

  output = escapeHtml(output);
  output = output.replace(
    /\*\*([^*]+)\*\*/g,
    (_match, bold) =>
      `<strong style="${STYLE.strong}">${bold}</strong>`
  );
  output = output.replace(
    /__([^_]+)__/g,
    (_match, bold) =>
      `<strong style="${STYLE.strong}">${bold}</strong>`
  );
  output = output.replace(/%%PLACEHOLDER_(\d+)%%/g, (_match, index) => {
    return placeholders[Number(index)] ?? "";
  });

  return output;
}

function renderParagraph(lines: string[]) {
  const content = lines.join(" ").trim();
  if (!content) return "";
  return `<p style="${STYLE.p}">${renderInline(content)}</p>`;
}

function renderImage(alt: string, url: string) {
  const safeAlt = escapeAttribute(alt);
  const safeUrl = escapeAttribute(url);
  return `<p style="${STYLE.imgWrap}"><img src="${safeUrl}" alt="${safeAlt}" style="${STYLE.img}" /></p>`;
}

function parseImageLine(line: string) {
  const match = line.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);
  if (!match) return null;
  return { alt: match[1] || "", url: match[2] || "" };
}

export function formatWechatHtml(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const blocks: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const rendered = renderParagraph(paragraph);
    if (rendered) blocks.push(rendered);
    paragraph = [];
  };

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      i += 1;
      continue;
    }

    if (line === "{{IMAGE_1}}" || line === "{{IMAGE_2}}") {
      flushParagraph();
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      const text = renderInline(line.slice(3).trim());
      blocks.push(
        `<p style="${STYLE.headingWrap}"><span style="${STYLE.headingText}">${text}</span></p>`
      );
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      const text = renderInline(line.slice(4).trim());
      blocks.push(
        `<p style="${STYLE.headingWrap}"><span style="${STYLE.headingTextSmall}">${text}</span></p>`
      );
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      const text = renderInline(line.slice(2).trim());
      blocks.push(
        `<p style="${STYLE.headingWrap}"><span style="${STYLE.headingText}">${text}</span></p>`
      );
      i += 1;
      continue;
    }

    const image = parseImageLine(line);
    if (image) {
      flushParagraph();
      if (image.url) {
        blocks.push(renderImage(image.alt, image.url));
      }
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        const cleaned = lines[i].trim().replace(/^>\s?/, "");
        if (cleaned) quoteLines.push(cleaned);
        i += 1;
      }
      const quoteText = renderInline(quoteLines.join(" ").trim());
      if (quoteText) {
        blocks.push(`<blockquote style="${STYLE.blockquote}">${quoteText}</blockquote>`);
      }
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, "");
        items.push(`<li style="${STYLE.li}">${renderInline(itemText)}</li>`);
        i += 1;
      }
      blocks.push(`<ul style="${STYLE.ul}">${items.join("")}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, "");
        items.push(`<li style="${STYLE.li}">${renderInline(itemText)}</li>`);
        i += 1;
      }
      blocks.push(`<ol style="${STYLE.ol}">${items.join("")}</ol>`);
      continue;
    }

    paragraph.push(line);
    i += 1;
  }

  flushParagraph();

  return `<section style="${STYLE.section}">${blocks.join("")}</section>`;
}

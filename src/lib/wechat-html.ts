const STYLE = {
  section:
    "font-size:16px;line-height:1.9;color:#3f3f3f;letter-spacing:0.2px;",
  p: "margin:12px 0;font-size:16px;line-height:1.9;color:#3f3f3f;",
  h2: "margin:22px 0 12px;font-size:18px;line-height:1.6;font-weight:700;color:#2f7a5e;",
  h3: "margin:18px 0 10px;font-size:16px;line-height:1.6;font-weight:700;color:#2f7a5e;",
  ul: "margin:10px 0;padding-left:18px;color:#3f3f3f;font-size:16px;line-height:1.9;",
  ol: "margin:10px 0;padding-left:18px;color:#3f3f3f;font-size:16px;line-height:1.9;",
  li: "margin:6px 0;",
  blockquote:
    "margin:12px 0;padding:10px 12px;background:#f7f7f7;border-left:3px solid #d9d9d9;color:#6a6a6a;font-size:15px;line-height:1.8;",
  imgWrap: "margin:16px 0;text-align:center;",
  img: "max-width:100%;height:auto;border-radius:10px;display:block;margin:0 auto;",
  strong: "font-weight:700;color:#2b2b2b;",
  code:
    "background:#f3f3f3;border-radius:4px;padding:2px 4px;font-size:13px;font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;",
  link: "color:#2f7a5e;text-decoration:underline;",
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
      blocks.push(
        `<h2 style="${STYLE.h2}">${renderInline(line.slice(3).trim())}</h2>`
      );
      i += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      blocks.push(
        `<h3 style="${STYLE.h3}">${renderInline(line.slice(4).trim())}</h3>`
      );
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      blocks.push(
        `<h2 style="${STYLE.h2}">${renderInline(line.slice(2).trim())}</h2>`
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

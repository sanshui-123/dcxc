const STYLE = {
  section: "margin:0;padding:0;background-color:#ffffff;",
  textSpan:
    "font-family: Optima-Regular, PingFangTC-light;" +
    "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);" +
    "margin-right: 0px;" +
    "margin-left: 0px;" +
    "padding: 0px;" +
    "outline: 0px;" +
    "max-width: 100%;" +
    "clear: both;" +
    "min-height: 1em;" +
    "font-variant-ligatures: normal;" +
    "font-variant-caps: normal;" +
    "orphans: 2;" +
    "widows: 2;" +
    "-webkit-text-stroke-width: 0px;" +
    "text-decoration-thickness: initial;" +
    "text-decoration-style: initial;" +
    "text-decoration-color: initial;" +
    "caret-color: rgb(74, 74, 74);" +
    "color: rgb(34, 34, 34);" +
    "font-size: 16px;" +
    "background-color: rgb(255, 255, 255);" +
    "letter-spacing: 2px;" +
    "visibility: visible;" +
    "box-sizing: border-box !important;" +
    "overflow-wrap: break-word !important;",
  secondarySpan:
    "font-family: Optima-Regular, PingFangTC-light;" +
    "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);" +
    "margin-right: 0px;" +
    "margin-left: 0px;" +
    "padding: 0px;" +
    "outline: 0px;" +
    "max-width: 100%;" +
    "clear: both;" +
    "min-height: 1em;" +
    "font-variant-ligatures: normal;" +
    "font-variant-caps: normal;" +
    "orphans: 2;" +
    "widows: 2;" +
    "-webkit-text-stroke-width: 0px;" +
    "text-decoration-thickness: initial;" +
    "text-decoration-style: initial;" +
    "text-decoration-color: initial;" +
    "caret-color: rgb(74, 74, 74);" +
    "color: rgb(150, 150, 150);" +
    "font-size: 15px;" +
    "background-color: rgb(255, 255, 255);" +
    "letter-spacing: 1.5px;" +
    "visibility: visible;" +
    "box-sizing: border-box !important;" +
    "overflow-wrap: break-word !important;",
  p:
    "-webkit-tap-highlight-color: rgba(0, 0, 0, 0);" +
    "margin: 0px 16px 20px;" +
    "padding: 0px;" +
    "outline: 0px;" +
    "max-width: 100%;" +
    "clear: both;" +
    "min-height: 1em;" +
    "color: rgb(34, 34, 34);" +
    "font-family: Optima-Regular, PingFangTC-light;" +
    "font-size: 16px;" +
    "font-style: normal;" +
    "font-variant-ligatures: normal;" +
    "font-variant-caps: normal;" +
    "font-weight: 400;" +
    "letter-spacing: 2px;" +
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
  highlight:
    "letter-spacing: 2px;color: rgb(171, 25, 66);font-weight: bold;",
  transitionWrap: "margin: 24px 16px 22px;text-align: center;",
  transitionBadge:
    "display: inline-block;padding: 10px 24px;border-radius: 999px;border: 1px solid rgba(47, 122, 94, 0.2);background: rgba(47, 122, 94, 0.08);color: rgb(11, 139, 102);font-size: 32px;font-weight: 700;letter-spacing: 2px;",
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
    /==([^=]+)==/g,
    (_match, highlighted) =>
      `<span style="${STYLE.highlight}">${highlighted}</span>`
  );
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

function splitByDelimiters(text: string, delimiters: string[]) {
  const segments: string[] = [];
  let buffer = "";
  for (const char of text) {
    buffer += char;
    if (delimiters.includes(char)) {
      if (buffer.trim()) segments.push(buffer.trim());
      buffer = "";
    }
  }
  if (buffer.trim()) segments.push(buffer.trim());
  return segments;
}

function countPlainChars(value: string) {
  return value.replace(/\s+/g, "").length;
}

function hardSplitByLength(text: string, maxChars: number) {
  const segments: string[] = [];
  let buffer = "";
  for (const char of text) {
    buffer += char;
    if (countPlainChars(buffer) >= maxChars) {
      segments.push(buffer.trim());
      buffer = "";
    }
  }
  if (buffer.trim()) segments.push(buffer.trim());
  return segments;
}

function splitParagraphContent(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();
  const maxChars = 48;
  if (countPlainChars(normalized) <= maxChars) return [normalized];

  const sentences = splitByDelimiters(normalized, [
    "。",
    "！",
    "？",
    "!",
    "?",
    "；",
    ";",
  ]);

  const grouped: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const candidate = current ? `${current}${sentence}` : sentence;
    if (current && countPlainChars(candidate) > maxChars) {
      grouped.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) grouped.push(current.trim());

  const finalSegments: string[] = [];
  for (const segment of grouped) {
    if (countPlainChars(segment) <= maxChars * 1.2) {
      finalSegments.push(segment.trim());
      continue;
    }
    const commas = splitByDelimiters(segment, ["，", ","]);
    for (const chunk of commas) {
      if (!chunk.trim()) continue;
      if (countPlainChars(chunk) > maxChars * 1.2) {
        finalSegments.push(...hardSplitByLength(chunk.trim(), maxChars));
      } else {
        finalSegments.push(chunk.trim());
      }
    }
  }

  return finalSegments.length > 0 ? finalSegments : [normalized];
}

function isSecondaryParagraph(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return false;
  const prefixes = [
    "注：",
    "备注：",
    "说明：",
    "提示：",
    "小提示：",
    "小贴士：",
    "来源：",
    "参考：",
    "数据：",
    "图：",
    "图注：",
    "图片：",
    "图片说明：",
    "引用：",
    "附：",
    "数据来源：",
    "引用数据：",
  ];
  if (prefixes.some((prefix) => trimmed.startsWith(prefix))) return true;
  if (trimmed.startsWith("（") && trimmed.endsWith("）") && trimmed.length < 90) {
    return true;
  }
  if (trimmed.startsWith("(") && trimmed.endsWith(")") && trimmed.length < 90) {
    return true;
  }
  if (
    trimmed.length < 80 &&
    /(来源|引用|参考|图注|图片说明|数据来源|数据|样本|注释)/.test(trimmed)
  ) {
    return true;
  }
  return false;
}

function isHighlightParagraph(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return false;
  const keywords = [
    "今日福利",
    "福利",
    "重点",
    "提醒",
    "注意",
    "结论",
    "核心",
    "关键",
    "划重点",
    "总结",
    "建议",
    "禁忌",
    "风险",
    "避坑",
    "误区",
    "必须",
    "不要",
    "切记",
    "慎用",
    "限时",
    "立省",
  ];
  const length = countPlainChars(trimmed);
  const hasKeyword = keywords.some((keyword) => trimmed.includes(keyword));
  const hasColon = trimmed.includes("：") || trimmed.includes(":");
  const hasBracket = /^【[^】]+】/.test(trimmed);
  const hasShortExclaim = length <= 36 && /[！!?]$/.test(trimmed);
  const hasNumbers =
    /\d/.test(trimmed) &&
    /(元|天|次|斤|克|岁|周|月|%|折)/.test(trimmed) &&
    length <= 40;

  if ((hasKeyword || hasColon || hasBracket) && length <= 60) return true;
  if (hasShortExclaim) return true;
  if (hasNumbers) return true;
  return false;
}

function renderParagraph(lines: string[]) {
  const content = lines.join(" ").trim();
  if (!content) return [];
  const segments = splitParagraphContent(content);
  return segments.map((segment) => {
    const spanStyle = isHighlightParagraph(segment)
      ? STYLE.highlight
      : isSecondaryParagraph(segment)
        ? STYLE.secondarySpan
        : STYLE.textSpan;
    return `<p style="${STYLE.p}"><span style="${spanStyle}">${renderInline(
      segment
    )}</span></p>`;
  });
}

function renderImage(alt: string, url: string) {
  const safeAlt = escapeAttribute(alt);
  const safeUrl = escapeAttribute(url);
  return `<p style="${STYLE.imgWrap}"><span><img src="${safeUrl}" alt="${safeAlt}" style="${STYLE.img}" /></span></p>`;
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
  let transitionIndex = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const rendered = renderParagraph(paragraph);
    for (const block of rendered) {
      blocks.push(block);
    }
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

    const transitionMatch = line.match(
      /^\[\[TRANSITION(?::\s*(\d+))?\]\]$|^\{\{TRANSITION\}\}$|^---$/
    );
    if (transitionMatch) {
      flushParagraph();
      const explicit = transitionMatch[1]
        ? Number.parseInt(transitionMatch[1], 10)
        : NaN;
      transitionIndex += 1;
      const label = Number.isFinite(explicit)
        ? explicit
        : transitionIndex;
      const text = `#${String(label).padStart(2, "0")}`;
      blocks.push(
        `<p style="${STYLE.transitionWrap}"><span style="${STYLE.transitionBadge}">${text}</span></p>`
      );
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
        blocks.push(
          `<blockquote style="${STYLE.blockquote}"><span style="${STYLE.textSpan}">${quoteText}</span></blockquote>`
        );
      }
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^[-*]\s+/, "");
        items.push(
          `<li style="${STYLE.li}"><span style="${STYLE.textSpan}">${renderInline(
            itemText
          )}</span></li>`
        );
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
        items.push(
          `<li style="${STYLE.li}"><span style="${STYLE.textSpan}">${renderInline(
            itemText
          )}</span></li>`
        );
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

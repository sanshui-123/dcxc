export const DEFAULT_PROMPT_NAME = "默认提示词";

export const LEGACY_DEFAULT_PROMPT_TEMPLATE = `请根据提供的原文内容改写为新的公众号文章。
要求：
1) 输出 JSON，包含 title、topic、markdown 三个字段。
2) topic 用 6-12 字概括文章主题。
3) markdown 正文不需要再写 # 标题，使用常见排版模板：
   - > 导语（2-3 句）
   - ## 小标题（3-5 段）
   - 要点清单（项目符号）
   - 适用人群/注意事项
   - 小结收束
4) 在 markdown 中安排 {{IMAGE_1}} 与 {{IMAGE_2}} 两个图片占位符，用于插图位置。
5) 正文不少于 1000 字（不包含空格/标点）。
6) 文章语言为简体中文，逻辑清晰、段落分明、可读性强。
7) 不要堆砌营销话术，不要添加未给出的事实，保持与原文一致的核心信息。
8) 标题需改写为更适合公众号的表达，但不夸大。

原文标题：{{title}}
原文链接：{{sourceUrl}}
原文 HTML：
{{html}}
`;

export const DEFAULT_PROMPT_TEMPLATE = `请在保持原文核心信息的前提下改写为公众号文章，语言克制、有温度，逻辑清晰、段落分明。`;

export const BASE_PROMPT_PREFIX = `请根据提供的原文内容改写为新的公众号文章。
统一格式要求：
1) 输出 JSON，包含 title、topic、markdown 三个字段。
2) title 为改写后的标题，不夸大，长度不超过 64 个字符（公众号标题上限），建议 18-28 字。
   - 标题必须是一句话，不要清单/配方/价格列表形式。
   - 禁止出现“1.、2.”这类序号开头，避免堆叠药材/规格/金额。
3) topic 用 6-12 字概括文章主题。
4) markdown 正文不需要再写 # 标题。
5) markdown 中必须包含 {{IMAGE_1}} 与 {{IMAGE_2}} 两个图片占位符（用于插图位置）。
6) 只输出 JSON，不要输出其他说明。
7) 文章语言为简体中文，不添加未给出的事实，保持与原文一致的核心信息。
8) 字数以自定义要求为准；如未指定，不少于 1000 字（不含空格/标点）。

自定义改写要求如下：
`;

export const BASE_PROMPT_SUFFIX = `
原文标题：{{title}}
原文链接：{{sourceUrl}}
原文 HTML：
{{html}}
`;

const PLACEHOLDER_REGEX = /\{\{\s*(title|sourceUrl|html)\s*\}\}/g;
const PLACEHOLDER_PATTERN = /\{\{\s*(title|sourceUrl|html)\s*\}\}/;

export function renderPromptTemplate(
  template: string,
  params: { title?: string; sourceUrl?: string; html?: string }
) {
  const replacements: Record<string, string> = {
    title: params.title?.trim() || "无",
    sourceUrl: params.sourceUrl?.trim() || "无",
    html: params.html || "",
  };

  return template.replace(PLACEHOLDER_REGEX, (_, key: string) => {
    return replacements[key] ?? "";
  });
}

export function buildPromptTemplate(
  template: string,
  params: { title?: string; sourceUrl?: string; html?: string }
) {
  const trimmed = template.trim();
  const combined = PLACEHOLDER_PATTERN.test(template)
    ? template
    : `${BASE_PROMPT_PREFIX}${trimmed || "（无）"}\n${BASE_PROMPT_SUFFIX}`;
  return renderPromptTemplate(combined, params);
}

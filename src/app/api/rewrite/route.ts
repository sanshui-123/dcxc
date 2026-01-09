import { NextResponse } from "next/server";
import { readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PROMPT_TEMPLATE, buildPromptTemplate } from "@/lib/prompts";

const DEFAULT_MODEL = "glm-4.7";
const DEFAULT_BASE_URL =
  "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const FALLBACK_MODEL = "glm-4.6";

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
];

type CompletionRequest = {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature: number;
};

type CompletionResult =
  | { ok: true; content: string }
  | { ok: false; error: string };

async function fetchCompletion({
  baseUrl,
  apiKey,
  model,
  messages,
  temperature,
}: CompletionRequest): Promise<CompletionResult> {
  const res = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!res.ok) {
    return { ok: false, error: `${model} 接口失败: ${res.status}` };
  }

  const parsed = await readJson<{
    choices?: Array<{ message?: { content?: string } }>;
  }>(res);
  if (!parsed.ok) {
    console.warn(`${model} 返回非 JSON`, {
      status: res.status,
      snippet: parsed.text.slice(0, 120),
    });
    return { ok: false, error: `${model} 返回非 JSON 响应。` };
  }

  const content = parsed.data.choices?.[0]?.message?.content?.trim() || "";
  if (!content) {
    return { ok: false, error: `${model} 未返回内容。` };
  }

  return { ok: true, content };
}

async function requestCompletionWithFallback(
  request: CompletionRequest,
  fallbackModel?: string
) {
  const primary = await fetchCompletion(request);
  if (primary.ok) {
    return { content: primary.content, model: request.model };
  }

  if (fallbackModel && fallbackModel !== request.model) {
    const fallback = await fetchCompletion({
      ...request,
      model: fallbackModel,
    });
    if (fallback.ok) {
      return { content: fallback.content, model: fallbackModel };
    }
    throw new Error(fallback.error);
  }

  throw new Error(primary.error);
}

function getTextLength(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]*]\([^)]+\)/g, "")
    .replace(/[#>*_`~>-]/g, "")
    .replace(/\s+/g, "")
    .length;
}

function normalizeTopic(value?: string) {
  if (!value) return "";
  return value
    .replace(/[，。；;：:,.!?！]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

function pickImages(coverUrl?: string) {
  const pool = [...IMAGE_POOL];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const unique = Array.from(
    new Set([coverUrl, ...pool].filter(Boolean))
  ) as string[];
  return {
    first: unique[0] || IMAGE_POOL[0],
    second: unique[1] || IMAGE_POOL[1],
  };
}

function injectImages(markdown: string, coverUrl?: string) {
  const { first, second } = pickImages(coverUrl);
  let output = markdown;
  const imageMatches = output.match(/!\[[^\]]*]\([^)]+\)/g) || [];
  const imageCount = imageMatches.length;

  output = output.replace(
    /^(\s*)\[(封面|配图|图片|图)\]\(([^)]+)\)/gm,
    "$1![$2]($3)"
  );

  if (output.includes("{{IMAGE_1}}")) {
    output = output.replace("{{IMAGE_1}}", `![封面](${first})`);
  } else if (imageCount === 0) {
    output = `![封面](${first})\n\n${output}`;
  }

  const secondTag = `![配图](${second})`;
  if (output.includes("{{IMAGE_2}}")) {
    output = output.replace("{{IMAGE_2}}", secondTag);
  } else if (imageCount < 2 && !output.includes(secondTag)) {
    const lines = output.split("\n");
    const h2Indexes = lines.reduce<number[]>((acc, line, idx) => {
      if (line.startsWith("## ")) acc.push(idx);
      return acc;
    }, []);
    const randomIndex =
      h2Indexes.length > 0
        ? h2Indexes[Math.floor(Math.random() * h2Indexes.length)] + 2
        : Math.min(6 + Math.floor(Math.random() * 4), lines.length);
    const insertIndex = Math.min(randomIndex, lines.length);
    lines.splice(insertIndex, 0, secondTag, "");
    output = lines.join("\n");
  }

  return output;
}

type ParsedRewrite = {
  title?: string;
  markdown?: string;
  topic?: string;
  theme?: string;
  subject?: string;
  "主题"?: string;
};

function tryParseJSON(content: string) {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    return JSON.parse(trimmed) as ParsedRewrite;
  } catch {
    return null;
  }
}

function resolveTopic(parsed: ParsedRewrite | null, fallback: string) {
  const raw =
    parsed?.topic ||
    parsed?.theme ||
    parsed?.subject ||
    parsed?.["主题"] ||
    "";
  return normalizeTopic(raw) || normalizeTopic(fallback) || "未分类";
}

function stripTitleExtras(value: string) {
  return value
    .replace(/^[\"'“”‘’\s]+|[\"'“”‘’\s]+$/g, "")
    .replace(/\s+/g, " ")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function clampTitle(value: string, maxLength = 64) {
  const trimmed = stripTitleExtras(value);
  if (!trimmed) return "未命名文章";
  const chars = Array.from(trimmed);
  if (chars.length <= maxLength) return trimmed;
  return chars.slice(0, maxLength).join("");
}

function isListLikeTitle(title: string) {
  return /^\s*[\d一二三四五六七八九十]+[.、\)\]]/.test(title);
}

function isTitleTooNumeric(title: string) {
  const digits = title.match(/\d/g) || [];
  const separators = title.match(/[，、]/g) || [];
  const priceHint = /(钱|元|￥|¥|克|g|斤|两)/.test(title) && /\d/.test(title);
  return digits.length >= 6 || separators.length >= 4 || priceHint;
}

function isTitleInvalid(title: string) {
  const trimmed = stripTitleExtras(title);
  if (!trimmed) return true;
  const length = Array.from(trimmed).length;
  if (length < 6 || length > 64) return true;
  if (isListLikeTitle(trimmed)) return true;
  if (isTitleTooNumeric(trimmed)) return true;
  return false;
}

function stripMarkdownForTitle(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]*]\([^)]+\)/g, "")
    .replace(/[#>*_`~>-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function rewriteTitle({
  baseUrl,
  apiKey,
  model,
  fallbackModel,
  systemPrompt,
  sourceTitle,
  topic,
  markdown,
}: {
  baseUrl: string;
  apiKey: string;
  model: string;
  fallbackModel?: string;
  systemPrompt: string;
  sourceTitle: string;
  topic: string;
  markdown: string;
}) {
  const summary = stripMarkdownForTitle(markdown).slice(0, 300);
  const titlePrompt = `请根据以下信息生成适合公众号的标题，仅输出标题文本，不要加引号或解释。
要求：
1) 18-28 字，最多不超过 64 字。
2) 一句话标题，不要清单/配方/价格/序号列表形式。
3) 语气克制、有温度，符合公众号读者阅读习惯。
4) 避免夸大和夸张承诺，不包含疗效/治病承诺。

原文标题：${sourceTitle || "无"}
主题：${topic || "无"}
正文摘要：${summary || "无"}
`;

  try {
    const result = await requestCompletionWithFallback(
      {
        baseUrl,
        apiKey,
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: titlePrompt },
        ],
        temperature: 0.4,
      },
      fallbackModel
    );
    return result.content.trim();
  } catch {
    return "";
  }
}

async function resolvePromptTemplate(promptId?: number) {
  try {
    if (promptId) {
      const prompt = await prisma.prompt.findUnique({ where: { id: promptId } });
      if (prompt?.template) return prompt.template;
    }

    const fallback = await prisma.prompt.findFirst({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return fallback?.template || DEFAULT_PROMPT_TEMPLATE;
  } catch {
    return DEFAULT_PROMPT_TEMPLATE;
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const html = typeof body.html === "string" ? body.html : "";
  const coverUrl =
    typeof body.coverUrl === "string" ? body.coverUrl : undefined;
  const sourceUrl =
    typeof body.sourceUrl === "string" ? body.sourceUrl : undefined;
  const promptId =
    typeof body.promptId === "number"
      ? body.promptId
      : typeof body.promptId === "string"
        ? Number(body.promptId)
        : undefined;

  if (!html) {
    return NextResponse.json(
      { ok: false, error: "正文内容不能为空。" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GLM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "缺少 GLM_API_KEY 配置。" },
      { status: 500 }
    );
  }

  const model = process.env.GLM_MODEL || DEFAULT_MODEL;
  const fallbackModel = model === FALLBACK_MODEL ? undefined : FALLBACK_MODEL;
  const baseUrl = process.env.GLM_API_BASE || DEFAULT_BASE_URL;

  const systemPrompt =
    "你是微信公众号资深编辑，擅长把原文改写成结构清晰、可直接发布的公众号文章。";

  const promptTemplate = await resolvePromptTemplate(
    Number.isFinite(promptId) ? promptId : undefined
  );
  const userPrompt = buildPromptTemplate(promptTemplate, {
    title,
    sourceUrl,
    html,
  });

  try {
    const rewriteResult = await requestCompletionWithFallback(
      {
        baseUrl,
        apiKey,
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      },
      fallbackModel
    );

    const content = rewriteResult.content.trim();
    const parsedContent = tryParseJSON(content);
    let draftTitle = clampTitle(
      parsedContent?.title?.trim() || title || "未命名文章"
    );
    const draftTopic = resolveTopic(parsedContent, draftTitle);
    let draftMarkdown = (parsedContent?.markdown?.trim() || content).trim();

    if (getTextLength(draftMarkdown) < 1000) {
      const expandPrompt = `请将下面的公众号文章在不新增事实的前提下扩写到 1000 字以上，保持原有结构和语气，输出 Markdown 正文即可（不需要 # 标题），不要输出 JSON：\n\n${draftMarkdown}\n`;
      try {
        const expanded = await requestCompletionWithFallback(
          {
            baseUrl,
            apiKey,
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: expandPrompt },
            ],
            temperature: 0.5,
          },
          fallbackModel
        );
        if (expanded.content) {
          draftMarkdown = expanded.content.trim();
        }
      } catch {
        // Keep original draftMarkdown if expansion fails.
      }
    }

    if (isTitleInvalid(draftTitle)) {
      const improved = await rewriteTitle({
        baseUrl,
        apiKey,
        model,
        fallbackModel,
        systemPrompt,
        sourceTitle: title,
        topic: draftTopic,
        markdown: draftMarkdown,
      });
      if (improved) {
        draftTitle = clampTitle(improved);
      }
    }

    const outputMarkdown = injectImages(draftMarkdown, coverUrl);

    return NextResponse.json({
      ok: true,
      data: { title: draftTitle, content: outputMarkdown, topic: draftTopic },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "无法连接改写接口。";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

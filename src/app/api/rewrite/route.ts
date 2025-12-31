import { NextResponse } from "next/server";
import { readJson } from "@/lib/http";

const DEFAULT_MODEL = "glm-4.7";
const DEFAULT_BASE_URL =
  "https://open.bigmodel.cn/api/paas/v4/chat/completions";

const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
];

function getTextLength(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[[^\]]*]\([^)]+\)/g, "")
    .replace(/[#>*_`~>-]/g, "")
    .replace(/\s+/g, "")
    .length;
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

function tryParseJSON(content: string) {
  const trimmed = content.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    return JSON.parse(trimmed) as { title?: string; markdown?: string };
  } catch {
    return null;
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
  const baseUrl = process.env.GLM_API_BASE || DEFAULT_BASE_URL;

  const systemPrompt =
    "你是微信公众号资深编辑，擅长把原文改写成结构清晰、可直接发布的公众号文章。";

  const userPrompt = `请根据提供的原文内容改写为新的公众号文章。\n要求：\n1) 输出 JSON，包含 title 和 markdown 两个字段。\n2) markdown 使用公众号常见排版模板：\n   - # 标题\n   - > 导语（2-3 句）\n   - ## 小标题（3-5 段）\n   - 要点清单（项目符号）\n   - 适用人群/注意事项\n   - 小结收束\n3) 在 markdown 中安排 {{IMAGE_1}} 与 {{IMAGE_2}} 两个图片占位符，用于插图位置。\n4) 正文不少于 1000 字（不包含空格/标点）。\n5) 文章语言为简体中文，逻辑清晰、段落分明、可读性强。\n6) 不要堆砌营销话术，不要添加未给出的事实，保持与原文一致的核心信息。\n7) 标题需改写为更适合公众号的表达，但不夸大。\n\n原文标题：${title || "无"}\n原文链接：${sourceUrl || "无"}\n原文 HTML：\n${html}\n`;

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `改写接口失败: ${res.status}` },
        { status: 502 }
      );
    }

    const parsed = await readJson<{
      choices?: Array<{ message?: { content?: string } }>;
    }>(res);
    if (!parsed.ok) {
      console.warn("GLM 返回非 JSON", {
        status: res.status,
        snippet: parsed.text.slice(0, 120),
      });
      return NextResponse.json(
        { ok: false, error: "改写接口返回非 JSON 响应。" },
        { status: 502 }
      );
    }

    const data = parsed.data;

    const content = data.choices?.[0]?.message?.content?.trim() || "";
    if (!content) {
      return NextResponse.json(
        { ok: false, error: "未获取到改写结果。" },
        { status: 502 }
      );
    }

    const parsed = tryParseJSON(content);
    const draftTitle = parsed?.title?.trim() || title || "未命名文章";
    let draftMarkdown = (parsed?.markdown?.trim() || content).trim();

    if (getTextLength(draftMarkdown) < 1000) {
      const expandPrompt = `请将下面的公众号文章在不新增事实的前提下扩写到 1000 字以上，保持原有结构和语气，输出 Markdown 正文即可，不要输出 JSON：\n\n${draftMarkdown}\n`;
      const expandRes = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: expandPrompt },
          ],
          temperature: 0.5,
        }),
      });

      if (expandRes.ok) {
        const expandParsed = await readJson<{
          choices?: Array<{ message?: { content?: string } }>;
        }>(expandRes);
        if (expandParsed.ok) {
          const expanded =
            expandParsed.data.choices?.[0]?.message?.content?.trim() || "";
          if (expanded) {
            draftMarkdown = expanded;
          }
        } else {
          console.warn("GLM 扩写返回非 JSON", {
            status: expandRes.status,
            snippet: expandParsed.text.slice(0, 120),
          });
        }
      }
    }

    const outputMarkdown = injectImages(draftMarkdown, coverUrl);

    return NextResponse.json({
      ok: true,
      data: { title: draftTitle, content: outputMarkdown },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "无法连接改写接口。";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

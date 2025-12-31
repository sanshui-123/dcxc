import { NextResponse } from "next/server";
import { readJson } from "@/lib/http";

const API_URL = "https://wx.limyai.com/api/openapi/wechat-publish";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const wechatAppid =
    typeof body.wechatAppid === "string" ? body.wechatAppid.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";

  if (!wechatAppid || !title || !content) {
    return NextResponse.json(
      { ok: false, error: "wechatAppid、title、content 为必填项。" },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.WECHAT_OPENAPI_KEY || process.env.WECHAT_ACCOUNTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "缺少 WECHAT_OPENAPI_KEY 配置。" },
      { status: 500 }
    );
  }

  const payload = {
    wechatAppid,
    title,
    content,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    coverImage: typeof body.coverImage === "string" ? body.coverImage : undefined,
    author: typeof body.author === "string" ? body.author : undefined,
    contentFormat:
      typeof body.contentFormat === "string" ? body.contentFormat : "markdown",
    articleType:
      typeof body.articleType === "string" ? body.articleType : "news",
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const parsed = await readJson(res);
    if (!parsed.ok) {
      console.warn("wechat-publish 返回非 JSON", {
        status: res.status,
        snippet: parsed.text.slice(0, 120),
      });
      return NextResponse.json(
        { ok: false, error: "上游返回非 JSON 响应。" },
        { status: 502 }
      );
    }

    const data = parsed.data as { success?: boolean; error?: string; code?: string };
    if (!res.ok || !data?.success) {
      const errorMessage = data?.error || `上游请求失败: ${res.status}`;
      return NextResponse.json(
        { ok: false, error: errorMessage, code: data?.code },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "无法连接上游接口。";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

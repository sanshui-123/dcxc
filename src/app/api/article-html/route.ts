import { NextResponse } from "next/server";
import type { DajialaArticleHtmlResponse } from "@/lib/dajiala";
import { readJson } from "@/lib/http";

const API_URL = "https://www.dajiala.com/fbmain/monitor/v3/article_html";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json(
      { ok: false, error: "文章链接不能为空。" },
      { status: 400 }
    );
  }

  const apiKey = process.env.DAJIALA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "缺少 DAJIALA_API_KEY 配置。" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, key: apiKey, verifycode: "" }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `上游请求失败: ${res.status}` },
        { status: 502 }
      );
    }

    const parsed = await readJson<DajialaArticleHtmlResponse>(res);
    if (!parsed.ok) {
      console.warn("article_html 返回非 JSON", {
        status: res.status,
        snippet: parsed.text.slice(0, 120),
      });
      return NextResponse.json(
        { ok: false, error: "上游返回非 JSON 响应。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, data: parsed.data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "无法连接上游接口。";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

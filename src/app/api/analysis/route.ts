import { NextResponse } from "next/server";
import type { DajialaResponse } from "@/lib/dajiala";

const API_URL = "https://www.dajiala.com/fbmain/monitor/v3/kw_search";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const kw = typeof body.kw === "string" ? body.kw.trim() : "";
  if (!kw) {
    return NextResponse.json(
      { ok: false, error: "关键词不能为空。" },
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

  const payload = {
    kw,
    sort_type: typeof body.sort_type === "number" ? body.sort_type : 1,
    mode: typeof body.mode === "number" ? body.mode : 1,
    period: typeof body.period === "number" ? body.period : 7,
    page: typeof body.page === "number" ? body.page : 1,
    key: apiKey,
    any_kw: typeof body.any_kw === "string" ? body.any_kw : "",
    ex_kw: typeof body.ex_kw === "string" ? body.ex_kw : "",
    verifycode: typeof body.verifycode === "string" ? body.verifycode : "",
    type: typeof body.type === "number" ? body.type : 1,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `上游请求失败: ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as DajialaResponse;
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "无法连接上游接口。";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

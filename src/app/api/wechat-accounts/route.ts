import { NextResponse } from "next/server";

const API_URL = "https://wx.limyai.com/api/openapi/wechat-accounts";

export async function POST() {
  const apiKey =
    process.env.WECHAT_OPENAPI_KEY || process.env.WECHAT_ACCOUNTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "缺少 WECHAT_ACCOUNTS_API_KEY 配置。" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `上游请求失败: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "无法连接上游接口。";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

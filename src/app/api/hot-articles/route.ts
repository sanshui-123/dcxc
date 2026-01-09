import { NextResponse } from "next/server";
import type { DajialaHotArticle, DajialaHotResponse } from "@/lib/dajiala";
import { readJson } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const API_URL =
  "https://www.dajiala.com/fbmain/monitor/v3/hot_typical_search";
const DEFAULT_CATEGORY = "17";
const DEFAULT_LIMIT = 5;

type HotArticleItem = {
  title: string;
  url: string;
  category: string;
  cover?: string;
  wxid?: string;
  mpNickname?: string;
  pubTime?: string;
  publishType?: string;
  position?: number;
  isOriginal?: string;
  readNum?: number;
  zanNum?: number;
  avg?: number;
  hot?: number;
  fans?: number;
};

function formatDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getDefaultRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 2);
  return { start: formatDate(start), end: formatDate(end) };
}

function normalizeCategory(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return `${value}`;
  return DEFAULT_CATEGORY;
}

function normalizeLimit(value: unknown) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, 20);
}

function toItem(article: DajialaHotArticle): HotArticleItem {
  return {
    title: article.title,
    url: article.url,
    category: article.category,
    cover: article.cover,
    wxid: article.wxid,
    mpNickname: article.mp_nickname,
    pubTime: article.pub_time,
    publishType: article.publish_type,
    position: article.position,
    isOriginal: article.is_original,
    readNum: article.read_num,
    zanNum: article.zan_num,
    avg: article.avg,
    hot: article.hot,
    fans: article.fans,
  };
}

function fromRecord(record: HotArticleItem) {
  return record;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = normalizeCategory(url.searchParams.get("category"));
  const limit = normalizeLimit(url.searchParams.get("limit"));

  try {
    const records = await prisma.hotArticle.findMany({
      where: { category },
      orderBy: { updatedAt: "desc" },
      take: limit,
    });
    const items = records.map((record) =>
      fromRecord({
        title: record.title,
        url: record.url,
        category: record.category,
        cover: record.cover ?? undefined,
        wxid: record.wxid ?? undefined,
        mpNickname: record.mpNickname ?? undefined,
        pubTime: record.pubTime ?? undefined,
        publishType: record.publishType ?? undefined,
        position: record.position ?? undefined,
        isOriginal: record.isOriginal ?? undefined,
        readNum: record.readNum ?? undefined,
        zanNum: record.zanNum ?? undefined,
        avg: record.avg ?? undefined,
        hot: record.hot ?? undefined,
        fans: record.fans ?? undefined,
      })
    );

    return NextResponse.json({ ok: true, data: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取爆文。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const apiKey = process.env.DAJIALA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "缺少 DAJIALA_API_KEY 配置。" },
      { status: 500 }
    );
  }

  const category = normalizeCategory(body.category);
  const limit = normalizeLimit(body.limit);
  const page =
    typeof body.page === "number" && Number.isFinite(body.page) && body.page > 0
      ? body.page
      : 1;
  const pubType =
    typeof body.pub_type === "string"
      ? body.pub_type
      : typeof body.pub_type === "number"
        ? `${body.pub_type}`
        : "0";
  const keyword = typeof body.keyword === "string" ? body.keyword : "";
  const range = getDefaultRange();
  const startTime =
    typeof body.start_time === "string" && body.start_time
      ? body.start_time
      : range.start;
  const endTime =
    typeof body.end_time === "string" && body.end_time
      ? body.end_time
      : range.end;

  const form = new FormData();
  form.set("key", apiKey);
  form.set("keyword", keyword);
  form.set("pub_type", pubType);
  form.set("category", category);
  form.set("page", String(page));
  form.set("start_time", startTime);
  form.set("end_time", endTime);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: form,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `上游请求失败: ${res.status}` },
        { status: 502 }
      );
    }

    const parsed = await readJson<DajialaHotResponse>(res);
    if (!parsed.ok) {
      console.warn("hot_typical_search 返回非 JSON", {
        status: res.status,
        snippet: parsed.text.slice(0, 120),
      });
      return NextResponse.json(
        { ok: false, error: "上游返回非 JSON 响应。" },
        { status: 502 }
      );
    }

    const data = parsed.data;
    if (data.code !== 0) {
      return NextResponse.json(
        { ok: false, error: data.msg || "爆文接口返回失败。" },
        { status: 502 }
      );
    }

    const items = (data.data ?? []).slice(0, limit).map(toItem);

    if (items.length > 0) {
      await prisma.$transaction(
        items.map((item) =>
          prisma.hotArticle.upsert({
            where: { url: item.url },
            create: {
              url: item.url,
              title: item.title,
              category: item.category,
              cover: item.cover,
              wxid: item.wxid,
              mpNickname: item.mpNickname,
              pubTime: item.pubTime,
              publishType: item.publishType,
              position: item.position,
              isOriginal: item.isOriginal,
              readNum: item.readNum,
              zanNum: item.zanNum,
              avg: item.avg,
              hot: item.hot,
              fans: item.fans,
            },
            update: {
              title: item.title,
              category: item.category,
              cover: item.cover,
              wxid: item.wxid,
              mpNickname: item.mpNickname,
              pubTime: item.pubTime,
              publishType: item.publishType,
              position: item.position,
              isOriginal: item.isOriginal,
              readNum: item.readNum,
              zanNum: item.zanNum,
              avg: item.avg,
              hot: item.hot,
              fans: item.fans,
            },
          })
        )
      );
    }

    return NextResponse.json({
      ok: true,
      data: items,
      meta: {
        page,
        total: data.total,
        totalPage: data.total_page,
        cost: data.cost,
        remain: data.remain_money,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "无法连接上游接口。";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}

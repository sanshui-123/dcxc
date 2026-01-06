import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PROMPT_NAME,
  DEFAULT_PROMPT_TEMPLATE,
  LEGACY_DEFAULT_PROMPT_TEMPLATE,
} from "@/lib/prompts";

async function ensureDefaultPrompt() {
  const count = await prisma.prompt.count();
  if (count === 0) {
    await prisma.prompt.create({
      data: {
        name: DEFAULT_PROMPT_NAME,
        template: DEFAULT_PROMPT_TEMPLATE,
        sortOrder: 1,
      },
    });
    return;
  }

  const defaultPrompt = await prisma.prompt.findFirst({
    where: { name: DEFAULT_PROMPT_NAME },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  if (!defaultPrompt) return;
  if (defaultPrompt.template !== LEGACY_DEFAULT_PROMPT_TEMPLATE) return;

  await prisma.prompt.update({
    where: { id: defaultPrompt.id },
    data: { template: DEFAULT_PROMPT_TEMPLATE },
  });
}

export async function GET() {
  try {
    await ensureDefaultPrompt();
    const prompts = await prisma.prompt.findMany({
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    });
    return NextResponse.json({ ok: true, data: prompts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取提示词。";
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const template = typeof body.template === "string" ? body.template : "";

  if (!name || !template) {
    return NextResponse.json(
      { ok: false, error: "name 和 template 为必填项。" },
      { status: 400 }
    );
  }

  try {
    const lastPrompt = await prisma.prompt.findFirst({
      orderBy: [{ sortOrder: "desc" }, { id: "desc" }],
    });
    const sortOrder = lastPrompt ? lastPrompt.sortOrder + 1 : 1;
    const prompt = await prisma.prompt.create({
      data: {
        name,
        template,
        sortOrder,
      },
    });

    return NextResponse.json({ ok: true, data: prompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法创建提示词。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const id =
    typeof body.id === "number"
      ? body.id
      : typeof body.id === "string"
        ? Number(body.id)
        : NaN;
  const direction = typeof body.direction === "string" ? body.direction : "";

  if (!Number.isFinite(id) || (direction !== "up" && direction !== "down")) {
    return NextResponse.json(
      { ok: false, error: "参数不合法。" },
      { status: 400 }
    );
  }

  try {
    const current = await prisma.prompt.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json(
        { ok: false, error: "提示词不存在。" },
        { status: 404 }
      );
    }

    const neighbor = await prisma.prompt.findFirst({
      where:
        direction === "up"
          ? { sortOrder: { lt: current.sortOrder } }
          : { sortOrder: { gt: current.sortOrder } },
      orderBy: { sortOrder: direction === "up" ? "desc" : "asc" },
    });

    if (!neighbor) {
      return NextResponse.json({ ok: true, data: { moved: false } });
    }

    await prisma.$transaction([
      prisma.prompt.update({
        where: { id: current.id },
        data: { sortOrder: neighbor.sortOrder },
      }),
      prisma.prompt.update({
        where: { id: neighbor.id },
        data: { sortOrder: current.sortOrder },
      }),
    ]);

    return NextResponse.json({ ok: true, data: { moved: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法移动提示词。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

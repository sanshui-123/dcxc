import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseId(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

async function readId(
  params: { id?: string } | Promise<{ id?: string }>
) {
  const resolved = await Promise.resolve(params);
  return parseId(resolved?.id);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id?: string } | Promise<{ id?: string }> }
) {
  const id = await readId(params);
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "无效的提示词 ID。" },
      { status: 400 }
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const template = typeof body.template === "string" ? body.template : undefined;
  const sortOrder =
    typeof body.sortOrder === "number" ? body.sortOrder : undefined;

  if (name === undefined && template === undefined && sortOrder === undefined) {
    return NextResponse.json(
      { ok: false, error: "没有可更新的字段。" },
      { status: 400 }
    );
  }

  try {
    const prompt = await prisma.prompt.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(template !== undefined ? { template } : {}),
        ...(sortOrder !== undefined ? { sortOrder } : {}),
      },
    });

    return NextResponse.json({ ok: true, data: prompt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法更新提示词。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id?: string } | Promise<{ id?: string }> }
) {
  const id = await readId(params);
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "无效的提示词 ID。" },
      { status: 400 }
    );
  }

  try {
    await prisma.prompt.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法删除提示词。";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

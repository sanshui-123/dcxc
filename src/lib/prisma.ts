import { PrismaClient } from "@prisma/client";
import path from "node:path";

function normalizeDatabaseUrl(value: string | undefined) {
  if (!value) return value;
  if (value.startsWith("file:./") || value.startsWith("file:../")) {
    const relativePath = value.replace(/^file:/, "");
    return `file:${path.resolve(process.cwd(), relativePath)}`;
  }
  return value;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const normalizedUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
if (normalizedUrl && normalizedUrl !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizedUrl;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

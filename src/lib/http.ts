export type JsonReadResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; text: string };

export async function readJson<T>(res: Response): Promise<JsonReadResult<T>> {
  const text = await res.text();
  if (!text) {
    return { ok: false, error: "响应为空", text: "" };
  }
  try {
    return { ok: true, data: JSON.parse(text) as T };
  } catch {
    return { ok: false, error: "响应不是合法 JSON", text };
  }
}

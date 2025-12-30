import { NextRequest } from "next/server";
import { streamGLMToResponse, Message } from "@/lib/glm4";

export async function POST(req: NextRequest) {
  try {
    const { messages, stream = true } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (stream) {
      // 流式响应
      return streamGLMToResponse(messages as Message[]);
    } else {
      // 普通响应 (需要导入 callGLM)
      const { callGLM } = await import("@/lib/glm4");
      const result = await callGLM(messages as Message[]);
      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

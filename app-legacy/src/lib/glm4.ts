// GLM-4.7 API 调用方法

const API_KEY = "a9f4f82550db4ac5b042f2a4b2f2bd44.P9wIMoCQUVnBoW3M";
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface GLMOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  thinking?: boolean;
}

export interface GLMResponse {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * GLM-4.7 普通调用
 */
export async function callGLM(
  messages: Message[],
  options: GLMOptions = {}
): Promise<GLMResponse> {
  const {
    model = "glm-4.7",
    max_tokens = 65536,
    temperature = 1.0,
    top_p = 0.9,
    thinking = true,
  } = options;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      thinking: thinking ? { type: "enabled" } : { type: "disabled" },
      max_tokens,
      temperature,
      top_p,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * GLM-4.7 流式调用
 */
export async function* streamGLM(
  messages: Message[],
  options: GLMOptions = {}
): AsyncGenerator<string, void, unknown> {
  const {
    model = "glm-4.7",
    max_tokens = 65536,
    temperature = 1.0,
    top_p = 0.9,
    thinking = true,
  } = options;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      thinking: thinking ? { type: "enabled" } : { type: "disabled" },
      stream: true,
      max_tokens,
      temperature,
      top_p,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Next.js API Route 用的流式响应处理
 */
export async function streamGLMToResponse(
  messages: Message[],
  options: GLMOptions = {}
): Promise<Response> {
  const {
    model = "glm-4.7",
    max_tokens = 65536,
    temperature = 1.0,
    top_p = 0.9,
    thinking = true,
  } = options;

  const glmResponse = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      thinking: thinking ? { type: "enabled" } : { type: "disabled" },
      stream: true,
      max_tokens,
      temperature,
      top_p,
    }),
  });

  if (!glmResponse.ok) {
    const errorText = await glmResponse.text();
    return new Response(JSON.stringify({ error: errorText }), {
      status: glmResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 创建转换流
  const transformer = new TransformStream({
    transform(chunk, controller) {
      const text = new TextDecoder().decode(chunk);
      controller.enqueue(new TextEncoder().encode(text));
    },
  });

  return new Response(glmResponse.body?.pipeThrough(transformer), {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

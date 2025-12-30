// GLM-4.7 Node.js 调用示例
// 运行: node scripts/glm4-test.js

const API_KEY = "a9f4f82550db4ac5b042f2a4b2f2bd44.P9wIMoCQUVnBoW3M";
const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// 普通调用
async function callGLM(messages, options = {}) {
  const {
    model = "glm-4.7",
    max_tokens = 65536,
    temperature = 1.0,
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// 流式调用
async function streamGLM(messages, options = {}) {
  const {
    model = "glm-4.7",
    max_tokens = 65536,
    temperature = 1.0,
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
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GLM API Error: ${response.status} - ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  process.stdout.write("流式响应: ");

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
            process.stdout.write(content);
          }
        } catch (e) {
          // 忽略解析错误
        }
      }
    }
  }
  console.log("\n");
}

// 主函数
async function main() {
  const messages = [
    {
      role: "user",
      content: "作为一名营销专家，请为我的产品创作一个吸引人的口号",
    },
    {
      role: "assistant",
      content: "当然，要创作一个吸引人的口号，请告诉我一些关于您产品的信息",
    },
    {
      role: "user",
      content: "智谱AI开放平台",
    },
  ];

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("GLM-4.7 API 调用测试");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 普通调用
  console.log("【普通调用】");
  try {
    const result = await callGLM(messages);
    console.log("响应:", result.choices?.[0]?.message?.content);
    console.log("Token 使用:", result.usage);
  } catch (error) {
    console.error("错误:", error.message);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // 流式调用
  console.log("【流式调用】");
  try {
    await streamGLM(messages);
  } catch (error) {
    console.error("错误:", error.message);
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch(console.error);

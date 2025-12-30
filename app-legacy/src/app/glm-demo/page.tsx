"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GLMDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [useStream, setUseStream] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      if (useStream) {
        // 流式调用
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, stream: true }),
        });

        if (!response.ok) throw new Error("API request failed");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
              try {
                const data = JSON.parse(trimmed.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1].content = assistantContent;
                    return updated;
                  });
                }
              } catch (e) {
                // 忽略解析错误
              }
            }
          }
        }
      } else {
        // 普通调用
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, stream: false }),
        });

        if (!response.ok) throw new Error("API request failed");

        const data = await response.json();
        const assistantContent = data.choices?.[0]?.message?.content || "";

        setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `错误: ${error instanceof Error ? error.message : "未知错误"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          GLM-4.7 对话演示
        </h1>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useStream}
                onChange={(e) => setUseStream(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">流式输出</span>
            </label>
            <button
              onClick={clearMessages}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              清空对话
            </button>
          </div>

          <div className="h-96 overflow-y-auto mb-4 p-4 bg-gray-50 rounded border">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center mt-20">开始对话吧！</p>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <span
                    className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-sans text-sm">
                      {msg.content}
                    </pre>
                  </span>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="输入消息..."
              disabled={loading}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "发送中..." : "发送"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 text-sm text-gray-600">
          <h2 className="font-semibold mb-2">使用说明：</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>支持普通调用和流式调用两种模式</li>
            <li>流式模式下响应会逐字显示</li>
            <li>使用 GLM-4.7 模型，支持思考模式 (thinking)</li>
            <li>访问路径: <code className="bg-gray-100 px-1 rounded">/glm-demo</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Layout from "@/components/Layout";

const suggestedTags = ["养生误区", "虫草吃法", "产地溯源", "鉴别真假", "礼品推荐", "价格分析"];

export default function AnalysisPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Layout title="AI 选题分析">
      <div className="max-w-4xl space-y-6">
        {/* Input Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <label className="block text-sm font-medium mb-3">输入关键词或行业热点</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例如：冬虫夏草、免疫力、滋补、中秋礼盒"
              className="flex-1 rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              disabled={loading || !input}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin h-4 w-4"></i>
                  分析中...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles h-4 w-4"></i>
                  AI 分析
                </>
              )}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">推荐标签：</span>
            {suggestedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md border border-border px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-muted cursor-pointer"
                onClick={() => setInput(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <i className="fa-solid fa-robot text-xl"></i>
            </div>
            <p>输入关键词后点击 AI 分析</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

"use client";

import { useState } from "react";
import Layout from "@/components/Layout";

export default function CreatePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <Layout title="内容创作">
      <div className="max-w-4xl">
        <div className="rounded-xl border border-border bg-card shadow-sm">
          {/* Header */}
          <div className="border-b border-border p-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className="w-full text-2xl font-semibold outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Editor */}
          <div className="p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="开始写作..."
              className="min-h-[400px] w-full resize-none outline-none placeholder:text-muted-foreground"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border p-4">
            <div className="flex items-center gap-1">
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <i className="fa-solid fa-bold h-4 w-4"></i>
              </button>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <i className="fa-solid fa-italic h-4 w-4"></i>
              </button>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <i className="fa-solid fa-heading h-4 w-4"></i>
              </button>
              <div className="w-px h-5 bg-border mx-1"></div>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <i className="fa-solid fa-list-ul h-4 w-4"></i>
              </button>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <i className="fa-solid fa-list-ol h-4 w-4"></i>
              </button>
              <div className="w-px h-5 bg-border mx-1"></div>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <i className="fa-regular fa-image h-4 w-4"></i>
              </button>
              <button className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition">
                <i className="fa-solid fa-link h-4 w-4"></i>
              </button>
            </div>
            <span className="text-sm text-muted-foreground">{content.length} 字</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-border p-4 bg-muted/30">
            <button className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition">
              存草稿
            </button>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
              发布文章
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
